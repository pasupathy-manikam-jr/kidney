<?php

namespace App\Enums;

/**
 * KDIGO albuminuria categories (A1–A3), from urine albumin-to-creatinine
 * ratio (UACR) in mg/g. NOT a diagnosis — confirm with the care team.
 */
enum AlbuminuriaCategory: string
{
    case A1 = 'A1';
    case A2 = 'A2';
    case A3 = 'A3';

    public static function fromUacr(float $uacr): self
    {
        return match (true) {
            $uacr < 30 => self::A1,
            $uacr <= 300 => self::A2,
            default => self::A3,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::A1 => 'Normal to mildly increased',
            self::A2 => 'Moderately increased',
            self::A3 => 'Severely increased',
        };
    }

    public function range(): string
    {
        return match ($this) {
            self::A1 => '<30',
            self::A2 => '30–300',
            self::A3 => '>300',
        };
    }
}
