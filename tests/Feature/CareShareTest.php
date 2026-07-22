<?php

use App\Models\User;

test('inviting an existing user links and accepts immediately', function () {
    $patient = User::factory()->create();
    $caregiver = User::factory()->create(['email' => 'nurse@example.com']);

    $this->actingAs($patient)
        ->post('/sharing', ['caregiver_email' => 'nurse@example.com', 'label' => 'PD nurse'])
        ->assertRedirect();

    $share = $patient->caregiverShares()->first();
    expect($share->caregiver_id)->toBe($caregiver->id)
        ->and($share->accepted_at)->not->toBeNull();
});

test('you cannot share with yourself', function () {
    $patient = User::factory()->create(['email' => 'me@example.com']);

    $this->actingAs($patient)
        ->post('/sharing', ['caregiver_email' => 'me@example.com'])
        ->assertSessionHasErrors('caregiver_email');
});

test('a pending invite is accepted when the caregiver visits shared', function () {
    $patient = User::factory()->create();
    $patient->caregiverShares()->create(['caregiver_email' => 'later@example.com']);

    $caregiver = User::factory()->create(['email' => 'later@example.com']);

    $this->actingAs($caregiver)->get('/shared')->assertOk();

    expect($caregiver->patientShares()->count())->toBe(1);
});

test('a caregiver can view a patient read-only and writes are blocked', function () {
    $patient = User::factory()->create();
    $patient->labResults()->create(['metric' => 'egfr', 'value' => 55, 'unit' => 'mL/min/1.73m²', 'measured_at' => '2026-06-01']);
    $caregiver = User::factory()->create(['email' => 'c@example.com']);
    $share = $patient->caregiverShares()->create([
        'caregiver_email' => 'c@example.com',
        'caregiver_id' => $caregiver->id,
        'accepted_at' => now(),
    ]);

    // Enter view.
    $this->actingAs($caregiver)->post("/shared/{$share->id}/view")->assertRedirect('/dashboard');

    // Dashboard now shows the patient's readings.
    $this->actingAs($caregiver)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page->where('totalReadings', 1));

    // Writing is blocked while viewing.
    $this->actingAs($caregiver)
        ->post('/lab-results', ['metric' => 'potassium', 'value' => 4, 'measured_at' => '2026-06-01'])
        ->assertForbidden();

    // Exit returns to own (empty) data.
    $this->actingAs($caregiver)->post('/shared/exit')->assertRedirect('/shared');
    $this->actingAs($caregiver)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page->where('totalReadings', 0));
});

test('a non-caregiver cannot enter a share view', function () {
    $patient = User::factory()->create();
    $stranger = User::factory()->create();
    $share = $patient->caregiverShares()->create([
        'caregiver_email' => 'someone@example.com',
        'caregiver_id' => User::factory()->create()->id,
        'accepted_at' => now(),
    ]);

    $this->actingAs($stranger)->post("/shared/{$share->id}/view")->assertForbidden();
});

test('a patient can revoke access', function () {
    $patient = User::factory()->create();
    $share = $patient->caregiverShares()->create(['caregiver_email' => 'x@example.com']);
    $other = User::factory()->create();

    $this->actingAs($other)->delete("/sharing/{$share->id}")->assertForbidden();
    $this->actingAs($patient)->delete("/sharing/{$share->id}")->assertRedirect();
    expect($patient->caregiverShares()->count())->toBe(0);
});
