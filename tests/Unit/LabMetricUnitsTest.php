<?php

use App\Enums\LabMetric;

test('metrics expose SI conversion info', function () {
    expect(LabMetric::Creatinine->si())->toBe(['unit' => 'µmol/L', 'factor' => 88.4, 'precision' => 0])
        ->and(LabMetric::Phosphorus->si()['unit'])->toBe('mmol/L')
        ->and(LabMetric::Potassium->si())->toBe(['unit' => 'mmol/L', 'factor' => 1.0, 'precision' => 1]);
});

test('metrics without a separate SI unit fall back to their own unit', function () {
    $egfr = LabMetric::Egfr->si();
    expect($egfr['unit'])->toBe(LabMetric::Egfr->unit())
        ->and($egfr['factor'])->toBe(1.0);
});

test('the catalog includes SI info for the frontend', function () {
    $creatinine = collect(LabMetric::catalog())->firstWhere('value', 'creatinine');
    expect($creatinine['si']['unit'])->toBe('µmol/L');
});
