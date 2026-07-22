<?php

use App\Enums\IntakeCategory;
use App\Models\User;

test('a user can set custom intake targets', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put('/intake-targets', ['fluid' => 1200, 'sodium' => 1800])
        ->assertRedirect();

    $user->refresh();
    expect($user->intakeTarget(IntakeCategory::Fluid))->toBe(1200)
        ->and($user->intakeTarget(IntakeCategory::Sodium))->toBe(1800)
        // unset falls back to the fixed suggestion
        ->and($user->intakeTarget(IntakeCategory::Potassium))->toBe(2000);
});

test('blank targets fall back to suggested limits', function () {
    $user = User::factory()->create(['intake_targets' => ['fluid' => 1000]]);

    $this->actingAs($user)
        ->put('/intake-targets', ['fluid' => null])
        ->assertRedirect();

    expect($user->fresh()->intakeTarget(IntakeCategory::Fluid))
        ->toBe(IntakeCategory::Fluid->suggestedLimit());
});

test('guests cannot set targets', function () {
    $this->put('/intake-targets', ['fluid' => 1000])->assertRedirect('/login');
});
