<?php

use App\Models\User;

test('a user can log a symptom', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/symptoms', [
            'symptom' => 'Fatigue',
            'severity' => 4,
            'note' => 'Worse in the afternoon',
            'logged_on' => '2026-07-01',
        ])
        ->assertRedirect();

    expect($user->symptomEntries()->count())->toBe(1)
        ->and($user->symptomEntries()->first()->severity)->toBe(4);
});

test('severity must be between 1 and 5', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/symptoms', ['symptom' => 'X', 'severity' => 9, 'logged_on' => '2026-07-01'])
        ->assertSessionHasErrors('severity');
});

test('a user cannot delete another users symptom entry', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $entry = $owner->symptomEntries()->create([
        'symptom' => 'Swelling',
        'severity' => 3,
        'logged_on' => '2026-07-01',
    ]);

    $this->actingAs($other)
        ->delete("/symptoms/{$entry->id}")
        ->assertForbidden();

    expect($owner->symptomEntries()->count())->toBe(1);
});

test('guests cannot access the symptom journal', function () {
    $this->get('/symptoms')->assertRedirect('/login');
});
