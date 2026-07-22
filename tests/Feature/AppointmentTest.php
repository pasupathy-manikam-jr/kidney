<?php

use App\Models\User;

test('a user can add an appointment', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/appointments', [
            'title' => 'Nephrology clinic',
            'scheduled_for' => now()->addWeek()->toDateString(),
            'time_of_day' => '09:30',
            'location' => 'City Hospital',
        ])
        ->assertRedirect();

    expect($user->appointments()->count())->toBe(1)
        ->and($user->appointments()->first()->title)->toBe('Nephrology clinic');
});

test('title and date are required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/appointments', ['location' => 'x'])
        ->assertSessionHasErrors(['title', 'scheduled_for']);
});

test('a user cannot delete another users appointment', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $appt = $owner->appointments()->create(['title' => 'X', 'scheduled_for' => '2026-08-01']);

    $this->actingAs($other)->delete("/appointments/{$appt->id}")->assertForbidden();
    expect($owner->appointments()->count())->toBe(1);
});

test('guests cannot access appointments', function () {
    $this->get('/appointments')->assertRedirect('/login');
});
