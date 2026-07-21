<?php

use App\Enums\GfrCategory;

test('eGFR maps to the correct KDIGO category at boundaries', function (float $egfr, string $code) {
    expect(GfrCategory::fromEgfr($egfr)->value)->toBe($code);
})->with([
    [120, 'G1'],
    [90, 'G1'],
    [89.9, 'G2'],
    [60, 'G2'],
    [59, 'G3a'],
    [45, 'G3a'],
    [44, 'G3b'],
    [30, 'G3b'],
    [29, 'G4'],
    [15, 'G4'],
    [14, 'G5'],
    [5, 'G5'],
]);
