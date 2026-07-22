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
    case Uacr = 'uacr';
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
            self::Uacr => 'Albuminuria (UACR)',
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
            self::Uacr => 'mg/g',
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
            self::Uacr => [null, 30],        // <30 mg/g normal (A1); higher = albuminuria
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
            self::Egfr, self::Bun, self::Uacr, self::SystolicBp, self::DiastolicBp => 0,
            self::Creatinine, self::Potassium, self::Phosphorus, self::Weight => 1,
        };
    }

    /**
     * SI-unit display info: [unit, factor (conventional × factor), precision].
     * factor 1 with the same unit means the metric has no separate SI unit.
     */
    public function si(): array
    {
        return match ($this) {
            self::Creatinine => ['unit' => 'µmol/L', 'factor' => 88.4, 'precision' => 0],
            self::Bun => ['unit' => 'mmol/L', 'factor' => 0.357, 'precision' => 1], // as urea
            self::Uacr => ['unit' => 'mg/mmol', 'factor' => 0.113, 'precision' => 1],
            self::Potassium => ['unit' => 'mmol/L', 'factor' => 1.0, 'precision' => 1],
            self::Phosphorus => ['unit' => 'mmol/L', 'factor' => 0.3229, 'precision' => 2],
            default => ['unit' => $this->unit(), 'factor' => 1.0, 'precision' => $this->precision()],
        };
    }

    /**
     * Critical thresholds [low, high] that warrant prompt medical attention.
     * General adult danger cut-offs — NOT a diagnosis. null = none defined.
     */
    public function criticalRange(): ?array
    {
        return match ($this) {
            self::Potassium => [3.0, 6.0],     // mEq/L: severe hypo/hyperkalaemia
            self::Egfr => [15, null],          // < 15 = kidney failure (G5)
            self::SystolicBp => [null, 180],   // hypertensive range
            self::DiastolicBp => [null, 120],
            self::Phosphorus => [null, 7.0],   // severe hyperphosphataemia
            default => null,
        };
    }

    /** True when the value crosses a critical threshold. */
    public function isCritical(float $value): bool
    {
        $range = $this->criticalRange();
        if ($range === null) {
            return false;
        }

        [$low, $high] = $range;

        return ($low !== null && $value < $low)
            || ($high !== null && $value > $high);
    }

    public function criticalMessage(float $value): ?string
    {
        if (! $this->isCritical($value)) {
            return null;
        }

        [$low] = $this->criticalRange();
        $dir = ($low !== null && $value < $low) ? 'low' : 'high';

        return "{$this->label()} of {$value} {$this->unit()} is very {$dir}. "
            .'If this is a new or unexpected result, contact your care team promptly.';
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
            'si' => $m->si(),
        ], self::cases());
    }
}
