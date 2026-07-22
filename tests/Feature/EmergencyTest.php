<?php

use App\Models\User;

test('a user can save care team contacts and empty rows are dropped', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put('/emergency-contacts', [
            'contacts' => [
                ['name' => 'PD Unit', 'role' => 'Nurse', 'phone' => '123'],
                ['name' => '', 'role' => '', 'phone' => ''],
            ],
        ])
        ->assertRedirect();

    $contacts = $user->fresh()->emergency_contacts;
    expect($contacts)->toHaveCount(1)
        ->and($contacts[0]['name'])->toBe('PD Unit');
});

test('guests cannot access the emergency page', function () {
    $this->get('/emergency')->assertRedirect('/login');
});
