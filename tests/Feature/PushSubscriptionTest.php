<?php

use App\Models\User;

test('a user can register a push subscription', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/push-subscriptions', [
            'endpoint' => 'https://push.example.com/abc',
            'keys' => ['p256dh' => 'pub-key', 'auth' => 'auth-token'],
        ])
        ->assertOk()
        ->assertJson(['ok' => true]);

    expect($user->pushSubscriptions()->count())->toBe(1)
        ->and($user->pushSubscriptions()->first()->endpoint)->toBe('https://push.example.com/abc');
});

test('re-registering the same endpoint updates rather than duplicates', function () {
    $user = User::factory()->create();
    $payload = [
        'endpoint' => 'https://push.example.com/abc',
        'keys' => ['p256dh' => 'k1', 'auth' => 'a1'],
    ];
    $this->actingAs($user)->postJson('/push-subscriptions', $payload)->assertOk();
    $this->actingAs($user)->postJson('/push-subscriptions', [
        ...$payload,
        'keys' => ['p256dh' => 'k2', 'auth' => 'a2'],
    ])->assertOk();

    expect($user->pushSubscriptions()->count())->toBe(1)
        ->and($user->pushSubscriptions()->first()->public_key)->toBe('k2');
});

test('a user can remove a push subscription', function () {
    $user = User::factory()->create();
    $user->pushSubscriptions()->create([
        'endpoint' => 'https://push.example.com/abc',
        'public_key' => 'k',
        'auth_token' => 'a',
    ]);

    $this->actingAs($user)
        ->deleteJson('/push-subscriptions', ['endpoint' => 'https://push.example.com/abc'])
        ->assertOk();

    expect($user->pushSubscriptions()->count())->toBe(0);
});

test('the reminders command runs without a configured push provider', function () {
    // No VAPID keys in the test env → command is a no-op but must not error.
    $this->artisan('reminders:send')->assertSuccessful();
});
