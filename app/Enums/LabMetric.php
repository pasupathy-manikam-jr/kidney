<?php

namespace App\Enums;

/**
 * Catalog of trackable kidney-related lab metrics.
 *
 * Reference ranges below are widely-cited GENERAL adult ranges. They are NOT a
 * diagnosis and vary by lab, age, sex, and clinical context. Always confirm the
 * ranges printed on the patient's own lab report and with their care team.
 */
enum LabMetric: string
{
    case Egfr = 'egfr';
    case Creatinine = 'creatinine';
    case Bun = 'bun';
    case Potassium = 'potassium';
    case Phosphorus = 'phosphorus';
    case SystolicBp = 'systolic_bp';
    case DiastolicBp = 'diastolic_bp';
    case Weight = 'weight';

    public function label(): string
    {
        return match ($this) {
            self::Egfr => 'eGFR',
            self::Creatinine => 'Creatinine',
            self::Bun => 'BUN',
            self::Potassium => 'Potassium',
            self::Phosphorus => 'Phosphorus',
            self::SystolicBp => 'Systolic BP',
            self::DiastolicBp => 'Diastolic BP',
            self::Weight => 'Weight',
        };
    }

    public function unit(): string
    {
        return match ($this) {
            self::Egfr => 'mL/min/1.73m²',
            self::Creatinine, self::Phosphorus => 'mg/dL',
            self::Bun => 'mg/dL',
            self::Potassium => 'mEq/L',
            self::SystolicBp, self::DiastolicBp => 'mmHg',
            self::Weight => 'kg',
        };
    }

    /**
     * General adult reference range [low, high], or null if not applicable.
     * Displayed as guidance only — see class-level warning.
     */
    public function referenceRange(): ?array
    {
        return match ($this) {
            self::Egfr => [90, null],        // >=90 normal; lower stages kidney disease
            self::Creatinine => [0.6, 1.3],
            self::Bun => [7, 20],
            self::Potassium => [3.5, 5.0],
            self::Phosphorus => [2.5, 4.5],
            self::SystolicBp => [90, 120],
            self::DiastolicBp => [60, 80],
            self::Weight => null,
        };
    }

    /** Decimal places sensible for display/entry. */
    public function precision(): int
    {
        return match ($this) {
            self::Egfr, self::Bun, self::SystolicBp, self::DiastolicBp => 0,
            self::Creatinine, self::Potassium, self::Phosphorus, self::Weight => 1,
        };
    }

    /**
     * Classify a value against the general reference range.
     * Returns 'low' | 'in_range' | 'high' | 'none' (no range defined).
     */
    public function status(float $value): string
    {
        $range = $this->referenceRange();

        if ($range === null) {
            return 'none';
        }

        [$low, $high] = $range;

        if ($low !== null && $value < $low) {
            return 'low';
        }

        if ($high !== null && $value > $high) {
            return 'high';
        }

        return 'in_range';
    }

    /** Serializable catalog for the frontend. */
    public static function catalog(): array
    {
        return array_map(fn (self $m) => [
            'value' => $m->value,
            'label' => $m->label(),
            'unit' => $m->unit(),
            'referenceRange' => $m->referenceRange(),
            'precision' => $m->precision(),
        ], self::cases());
    }
}
