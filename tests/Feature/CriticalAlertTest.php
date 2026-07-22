<?php

use App\Enums\LabMetric;
use App\Models\User;

test('a critical potassium reading flashes an alert', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/lab-results', [
            'metric' => 'potassium',
            'value' => 6.5,
            'measured_at' => '2026-07-01',
        ])
        ->assertRedirect()
        ->assertSessionHas('alert');
});

test('a normal reading does not flash an alert', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/lab-results', [
            'metric' => 'potassium',
            'value' => 4.5,
            'measured_at' => '2026-07-01',
        ])
        ->assertRedirect()
        ->assertSessionMissing('alert');
});

test('critical range detection', function () {
    expect(LabMetric::Potassium->isCritical(6.5))->toBeTrue()
        ->and(LabMetric::Potassium->isCritical(2.5))->toBeTrue()
        ->and(LabMetric::Potassium->isCritical(4.5))->toBeFalse()
        ->and(LabMetric::Egfr->isCritical(10))->toBeTrue()
        ->and(LabMetric::Creatinine->isCritical(99))->toBeFalse(); // no critical range
});
