<?php

use App\Models\User;

test('a user can add a medication', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/medications', [
            'name' => 'Amlodipine',
            'dosage' => '5 mg',
            'frequency' => 'Once daily',
            'time_of_day' => 'Morning',
            'active' => true,
        ])
        ->assertRedirect();

    expect($user->medications()->count())->toBe(1)
        ->and($user->medications()->first()->name)->toBe('Amlodipine');
});

test('a reminder time can be set and must be H:i', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/medications', ['name' => 'Furosemide', 'reminder_time' => '08:30', 'active' => true])
        ->assertRedirect();
    expect($user->medications()->first()->reminder_time)->toBe('08:30');

    $this->actingAs($user)
        ->post('/medications', ['name' => 'Bad', 'reminder_time' => '25:99', 'active' => true])
        ->assertSessionHasErrors('reminder_time');
});

test('name is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/medications', ['dosage' => '5 mg'])
        ->assertSessionHasErrors('name');
});

test('a user cannot modify another users medication', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $med = $owner->medications()->create(['name' => 'Furosemide', 'active' => true]);

    $this->actingAs($other)
        ->put("/medications/{$med->id}", ['name' => 'Hacked', 'active' => true])
        ->assertForbidden();

    $this->actingAs($other)
        ->delete("/medications/{$med->id}")
        ->assertForbidden();

    expect($med->fresh()->name)->toBe('Furosemide');
});

test('guests cannot access medications', function () {
    $this->get('/medications')->assertRedirect('/login');
});
