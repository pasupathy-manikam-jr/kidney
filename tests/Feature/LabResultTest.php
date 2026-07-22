<?php

use App\Models\LabResult;
use App\Models\User;

test('a user can store a lab result and the unit is set from the catalog', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/lab-results', [
            'metric' => 'potassium',
            'value' => 4.5,
            'measured_at' => '2026-07-01',
            'unit' => 'BOGUS', // should be ignored — server uses catalog unit
        ])
        ->assertRedirect();

    $result = LabResult::first();
    expect($result->user_id)->toBe($user->id)
        ->and($result->metric->value)->toBe('potassium')
        ->and((float) $result->value)->toBe(4.5)
        ->and($result->unit)->toBe('mEq/L');
});

test('an invalid metric is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/lab-results', [
            'metric' => 'not_a_metric',
            'value' => 1,
            'measured_at' => '2026-07-01',
        ])
        ->assertSessionHasErrors('metric');

    expect(LabResult::count())->toBe(0);
});

test('a future measured_at date is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/lab-results', [
            'metric' => 'egfr',
            'value' => 60,
            'measured_at' => now()->addDay()->toDateString(),
        ])
        ->assertSessionHasErrors('measured_at');
});

test('a user can update their own lab result', function () {
    $user = User::factory()->create();
    $result = $user->labResults()->create([
        'metric' => 'potassium',
        'value' => 4.0,
        'unit' => 'mEq/L',
        'measured_at' => '2026-06-01',
    ]);

    $this->actingAs($user)
        ->put("/lab-results/{$result->id}", [
            'metric' => 'creatinine',
            'value' => 1.2,
            'measured_at' => '2026-06-15',
            'unit' => 'BOGUS',
        ])
        ->assertRedirect();

    $result->refresh();
    expect($result->metric->value)->toBe('creatinine')
        ->and((float) $result->value)->toBe(1.2)
        ->and($result->unit)->toBe('mg/dL'); // from catalog, not client
});

test('a user cannot update another users lab result', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $result = $owner->labResults()->create([
        'metric' => 'creatinine',
        'value' => 1.1,
        'unit' => 'mg/dL',
        'measured_at' => '2026-07-01',
    ]);

    $this->actingAs($other)
        ->put("/lab-results/{$result->id}", [
            'metric' => 'creatinine',
            'value' => 9.9,
            'measured_at' => '2026-07-01',
        ])
        ->assertForbidden();

    expect((float) $result->fresh()->value)->toBe(1.1);
});

test('a user cannot delete another users lab result', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $result = $owner->labResults()->create([
        'metric' => 'creatinine',
        'value' => 1.1,
        'unit' => 'mg/dL',
        'measured_at' => '2026-07-01',
    ]);

    $this->actingAs($other)
        ->delete("/lab-results/{$result->id}")
        ->assertForbidden();

    expect(LabResult::find($result->id))->not->toBeNull();
});

test('guests cannot access lab results', function () {
    $this->get('/lab-results')->assertRedirect('/login');
});
