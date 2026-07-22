<?php

use App\Models\User;

test('the report aggregates latest values, categories, and history', function () {
    $user = User::factory()->create(['name' => 'Jane Doe']);

    $user->labResults()->create(['metric' => 'egfr', 'value' => 40, 'unit' => 'mL/min/1.73m²', 'measured_at' => '2026-07-01']);
    $user->labResults()->create(['metric' => 'uacr', 'value' => 120, 'unit' => 'mg/g', 'measured_at' => '2026-07-01']);

    $this->actingAs($user)
        ->get('/report')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('report')
            ->where('patientName', 'Jane Doe')
            ->where('totalReadings', 2)
            ->where('gfr.code', 'G3b')
            ->where('albuminuria.code', 'A2')
            ->where('risk.level', 4)
            ->where('history', fn ($h) => count($h) === 2)
        );
});

test('guests cannot access the report', function () {
    $this->get('/report')->assertRedirect('/login');
});
