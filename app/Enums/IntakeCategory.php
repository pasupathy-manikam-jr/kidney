<?php

namespace App\Enums;

/**
 * Categories for the diet & fluid log. Suggested daily limits are general
 * CKD-oriented values — NOT prescriptions. Confirm targets with the care team.
 */
enum IntakeCategory: string
{
    case Fluid = 'fluid';
    case Sodium = 'sodium';
    case Potassium = 'potassium';
    case Phosphorus = 'phosphorus';

    public function label(): string
    {
        return match ($this) {
            self::Fluid => 'Fluid',
            self::Sodium => 'Sodium',
            self::Potassium => 'Potassium',
            self::Phosphorus => 'Phosphorus',
        };
    }

    public function unit(): string
    {
        return match ($this) {
            self::Fluid => 'mL',
            self::Sodium, self::Potassium, self::Phosphorus => 'mg',
        };
    }

    /** Suggested general daily limit (upper guidance), or null. */
    public function suggestedLimit(): ?int
    {
        return match ($this) {
            self::Fluid => 1500,
            self::Sodium => 2000,
            self::Potassium => 2000,
            self::Phosphorus => 1000,
        };
    }

    public static function catalog(): array
    {
        return array_map(fn (self $c) => [
            'value' => $c->value,
            'label' => $c->label(),
            'unit' => $c->unit(),
            'suggestedLimit' => $c->suggestedLimit(),
        ], self::cases());
    }
}
