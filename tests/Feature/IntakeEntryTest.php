<?php

use App\Models\User;

test('a user can log an intake entry and the unit comes from the category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/intake', [
            'category' => 'fluid',
            'amount' => 250,
            'label' => 'Water',
            'logged_on' => '2026-07-01',
            'unit' => 'BOGUS',
        ])
        ->assertRedirect();

    $entry = $user->intakeEntries()->first();
    expect($entry->category->value)->toBe('fluid')
        ->and((float) $entry->amount)->toBe(250.0)
        ->and($entry->unit)->toBe('mL');
});

test('an invalid category is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/intake', ['category' => 'sugar', 'amount' => 10, 'logged_on' => '2026-07-01'])
        ->assertSessionHasErrors('category');
});

test('a user cannot delete another users intake entry', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $entry = $owner->intakeEntries()->create([
        'category' => 'sodium',
        'amount' => 500,
        'unit' => 'mg',
        'logged_on' => '2026-07-01',
    ]);

    $this->actingAs($other)
        ->delete("/intake/{$entry->id}")
        ->assertForbidden();

    expect($owner->intakeEntries()->count())->toBe(1);
});

test('guests cannot access the intake log', function () {
    $this->get('/intake')->assertRedirect('/login');
});
