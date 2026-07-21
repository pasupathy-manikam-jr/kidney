<?php

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Support\KdigoRisk;

test('UACR maps to the correct albuminuria category', function (float $uacr, string $code) {
    expect(AlbuminuriaCategory::fromUacr($uacr)->value)->toBe($code);
})->with([
    [10, 'A1'],
    [29.9, 'A1'],
    [30, 'A2'],
    [300, 'A2'],
    [300.1, 'A3'],
    [1200, 'A3'],
]);

test('KDIGO grid returns expected risk levels', function (string $gfr, string $alb, int $level) {
    expect(KdigoRisk::level(GfrCategory::from($gfr), AlbuminuriaCategory::from($alb)))->toBe($level);
})->with([
    ['G1', 'A1', 1],   // low
    ['G1', 'A3', 3],   // high
    ['G3a', 'A1', 2],  // moderate
    ['G3b', 'A2', 4],  // very high
    ['G4', 'A1', 4],   // very high
    ['G5', 'A3', 4],   // very high
]);
