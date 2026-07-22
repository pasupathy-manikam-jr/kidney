<?php

use App\Models\User;

test('a user can save catheter details and gets a next change date', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put('/catheter', [
            'brand' => 'Covidien',
            'catheter_type' => 'Tenckhoff coiled',
            'transfer_set_changed_on' => '2026-05-01',
            'transfer_set_interval_months' => 6,
        ])
        ->assertRedirect();

    $catheter = $user->catheters()->first();
    expect($catheter->brand)->toBe('Covidien')
        ->and($catheter->nextTransferSetChange()->toDateString())->toBe('2026-11-01');
});

test('updating catheter details reuses the single record', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->put('/catheter', ['transfer_set_interval_months' => 6, 'brand' => 'A']);
    $this->actingAs($user)->put('/catheter', ['transfer_set_interval_months' => 6, 'brand' => 'B']);

    expect($user->catheters()->count())->toBe(1)
        ->and($user->catheters()->first()->brand)->toBe('B');
});

test('a user can log an exchange and ultrafiltration is computed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/catheter-logs', [
            'logged_on' => '2026-07-01',
            'fill_volume' => 2000,
            'drain_volume' => 2300,
            'effluent_color' => 'clear',
        ])
        ->assertRedirect();

    $log = $user->catheterLogs()->first();
    expect($log->ultrafiltration())->toBe(300)
        ->and($log->effluent_color->value)->toBe('clear');
});

test('an invalid effluent colour is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/catheter-logs', ['logged_on' => '2026-07-01', 'effluent_color' => 'purple'])
        ->assertSessionHasErrors('effluent_color');
});

test('a user cannot delete another users exchange log', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $log = $owner->catheterLogs()->create(['logged_on' => '2026-07-01', 'effluent_color' => 'clear']);

    $this->actingAs($other)->delete("/catheter-logs/{$log->id}")->assertForbidden();
    expect($owner->catheterLogs()->count())->toBe(1);
});

test('guests cannot access dialysis', function () {
    $this->get('/dialysis')->assertRedirect('/login');
});
