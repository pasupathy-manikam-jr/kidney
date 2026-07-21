<?php

namespace App\Support;

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;

/**
 * KDIGO CKD risk heat-map: GFR category (G1–G5) × albuminuria category
 * (A1–A3) → risk level. Level 1 = low, 4 = very high.
 *
 * Source: KDIGO 2012/2024 CKD guideline "heat map". This is a general
 * prognosis grid, NOT a diagnosis. Confirm with the care team.
 */
class KdigoRisk
{
    /** [GFR code][Albuminuria code] => risk level 1..4 */
    private const GRID = [
        'G1' => ['A1' => 1, 'A2' => 2, 'A3' => 3],
        'G2' => ['A1' => 1, 'A2' => 2, 'A3' => 3],
        'G3a' => ['A1' => 2, 'A2' => 3, 'A3' => 4],
        'G3b' => ['A1' => 3, 'A2' => 4, 'A3' => 4],
        'G4' => ['A1' => 4, 'A2' => 4, 'A3' => 4],
        'G5' => ['A1' => 4, 'A2' => 4, 'A3' => 4],
    ];

    private const LABELS = [
        1 => 'Low risk',
        2 => 'Moderately increased risk',
        3 => 'High risk',
        4 => 'Very high risk',
    ];

    public static function level(GfrCategory $gfr, AlbuminuriaCategory $alb): int
    {
        return self::GRID[$gfr->value][$alb->value];
    }

    public static function label(int $level): string
    {
        return self::LABELS[$level];
    }

    /** Full grid serialized for the frontend heat-map. */
    public static function grid(): array
    {
        return self::GRID;
    }
}
