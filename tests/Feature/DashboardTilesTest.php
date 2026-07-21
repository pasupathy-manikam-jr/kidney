<?php

use App\Models\User;

test('the dashboard shows a tile per metric with the latest value and status', function () {
    $user = User::factory()->create();

    // Two potassium readings — latest wins; 6.0 is above the 3.5–5.0 range.
    $user->labResults()->create(['metric' => 'potassium', 'value' => 4.2, 'unit' => 'mEq/L', 'measured_at' => '2026-06-01']);
    $user->labResults()->create(['metric' => 'potassium', 'value' => 6.0, 'unit' => 'mEq/L', 'measured_at' => '2026-07-01']);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('totalReadings', 2)
            ->where('tiles', function ($tiles) {
                $potassium = collect($tiles)->firstWhere('metric', 'potassium');

                return $potassium['status'] === 'high'
                    && (float) $potassium['value'] === 6.0
                    && (float) $potassium['previousValue'] === 4.2;
            })
        );
});

test('metrics with no readings render as empty tiles', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('totalReadings', 0)
            ->where('tiles', fn ($tiles) => collect($tiles)->every(fn ($t) => $t['status'] === 'empty'))
        );
});
