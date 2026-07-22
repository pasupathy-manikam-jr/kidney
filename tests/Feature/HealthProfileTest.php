<?php

use App\Models\User;

test('a user can save sex, date of birth and dry weight', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'sex' => 'male',
            'date_of_birth' => '1968-04-10',
            'dry_weight' => 72.5,
        ])
        ->assertSessionHasNoErrors();

    $user->refresh();
    expect($user->sex)->toBe('male')
        ->and($user->date_of_birth->toDateString())->toBe('1968-04-10')
        ->and((float) $user->dry_weight)->toBe(72.5)
        ->and($user->age)->toBeGreaterThan(50);
});

test('an invalid sex is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'sex' => 'other',
        ])
        ->assertSessionHasErrors('sex');
});
