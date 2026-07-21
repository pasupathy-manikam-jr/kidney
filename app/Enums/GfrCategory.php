<?php

namespace App\Enums;

/**
 * KDIGO GFR categories (G1–G5), derived from eGFR in mL/min/1.73m².
 *
 * These are the standard GFR *categories* from the KDIGO 2012/2024 CKD
 * guideline. A full CKD diagnosis/stage also requires markers of kidney
 * damage (e.g. albuminuria) and chronicity (>3 months) — this app only
 * classifies the GFR value. NOT a diagnosis. Confirm with the care team.
 */
enum GfrCategory: string
{
    case G1 = 'G1';
    case G2 = 'G2';
    case G3a = 'G3a';
    case G3b = 'G3b';
    case G4 = 'G4';
    case G5 = 'G5';

    public static function fromEgfr(float $egfr): self
    {
        return match (true) {
            $egfr >= 90 => self::G1,
            $egfr >= 60 => self::G2,
            $egfr >= 45 => self::G3a,
            $egfr >= 30 => self::G3b,
            $egfr >= 15 => self::G4,
            default => self::G5,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::G1 => 'Normal or high',
            self::G2 => 'Mildly decreased',
            self::G3a => 'Mildly to moderately decreased',
            self::G3b => 'Moderately to severely decreased',
            self::G4 => 'Severely decreased',
            self::G5 => 'Kidney failure',
        };
    }

    public function range(): string
    {
        return match ($this) {
            self::G1 => '≥90',
            self::G2 => '60–89',
            self::G3a => '45–59',
            self::G3b => '30–44',
            self::G4 => '15–29',
            self::G5 => '<15',
        };
    }

    /** Severity 1 (best) .. 5 (worst) — for UI color ramp. */
    public function severity(): int
    {
        return match ($this) {
            self::G1 => 1,
            self::G2 => 2,
            self::G3a => 3,
            self::G3b => 3,
            self::G4 => 4,
            self::G5 => 5,
        };
    }
}
