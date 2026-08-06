<?php

namespace App\Enums;

/**
 * Catalog of trackable lab metrics.
 *
 * Reference ranges below are widely-cited GENERAL adult ranges (several taken
 * from a Malaysian MOH dialysis chart). They are NOT a diagnosis and vary by
 * lab, age, sex, and clinical context. Always confirm against the patient's own
 * lab report and care team.
 */
enum LabMetric: string
{
    // Core kidney metrics (shown on the dashboard).
    case Egfr = 'egfr';
    case Creatinine = 'creatinine';
    case Bun = 'bun';
    case Uacr = 'uacr';
    case Potassium = 'potassium';
    case Phosphorus = 'phosphorus';
    case SystolicBp = 'systolic_bp';
    case DiastolicBp = 'diastolic_bp';
    case Weight = 'weight';

    // Extended biochemistry.
    case Urea = 'urea';
    case Sodium = 'sodium';
    case Chloride = 'chloride';
    case UricAcid = 'uric_acid';
    case TotalProtein = 'total_protein';
    case Albumin = 'albumin';
    case TotalBilirubin = 'total_bilirubin';
    case AlkPhosphatase = 'alk_phosphatase';
    case Alt = 'alt';
    case Calcium = 'calcium';
    case Magnesium = 'magnesium';
    case TotalCholesterol = 'total_cholesterol';
    case Triglyceride = 'triglyceride';
    case LdlCholesterol = 'ldl_cholesterol';
    case HdlCholesterol = 'hdl_cholesterol';
    case Fbs = 'fbs';

    // Haematology.
    case Hb = 'hb';
    case Twdc = 'twdc';
    case Hct = 'hct';
    case Platelets = 'platelets';
    case Mcv = 'mcv';
    case Mchc = 'mchc';
    case SrIron = 'sr_iron';
    case Tibc = 'tibc';
    case TransferrinRatio = 'transferrin_ratio';
    case SrFerritin = 'sr_ferritin';

    /**
     * Per-metric metadata: [label, unit, [low, high] range (nulls allowed) or
     * null, decimal precision].
     */
    private const META = [
        'egfr' => ['eGFR', 'mL/min/1.73m²', [90, null], 0],
        'creatinine' => ['Creatinine', 'mg/dL', [0.6, 1.3], 1],
        'bun' => ['BUN', 'mg/dL', [7, 20], 0],
        'uacr' => ['Albuminuria (UACR)', 'mg/g', [null, 30], 0],
        'potassium' => ['Potassium', 'mEq/L', [3.5, 5.0], 1],
        'phosphorus' => ['Phosphorus', 'mg/dL', [2.5, 4.5], 1],
        'systolic_bp' => ['Systolic BP', 'mmHg', [90, 120], 0],
        'diastolic_bp' => ['Diastolic BP', 'mmHg', [60, 80], 0],
        'weight' => ['Weight', 'kg', null, 1],

        'urea' => ['Urea', 'mmol/L', [1.7, 8.3], 1],
        'sodium' => ['Sodium', 'mmol/L', [135, 145], 0],
        'chloride' => ['Chloride', 'mmol/L', [96, 108], 0],
        'uric_acid' => ['Uric Acid', 'µmol/L', [142, 416], 0],
        'total_protein' => ['Total Protein', 'g/L', [66, 87], 0],
        'albumin' => ['Albumin', 'g/L', [35, 50], 0],
        'total_bilirubin' => ['Total Bilirubin', 'µmol/L', [null, 21], 1],
        'alk_phosphatase' => ['Alk Phosphatase', 'U/L', [53, 128], 0],
        'alt' => ['Alanine Transaminase (ALT)', 'U/L', [null, 42], 0],
        'calcium' => ['Calcium', 'mmol/L', [2.0, 2.6], 2],
        'magnesium' => ['Magnesium', 'mmol/L', [0.7, 1.10], 2],
        'total_cholesterol' => ['Total Cholesterol', 'mmol/L', [null, 5.7], 1],
        'triglyceride' => ['Triglyceride', 'mmol/L', [null, 1.7], 1],
        'ldl_cholesterol' => ['LDL Cholesterol', 'mmol/L', [null, 3.9], 1],
        'hdl_cholesterol' => ['HDL Cholesterol', 'mmol/L', [1.4, null], 1],
        'fbs' => ['Fasting Blood Sugar', 'mmol/L', [3.5, 6.0], 1],

        'hb' => ['Haemoglobin', 'g/dL', null, 1],
        'twdc' => ['White Cell Count', '×10⁹/L', null, 1],
        'hct' => ['Haematocrit', '%', null, 1],
        'platelets' => ['Platelets', '×10⁹/L', null, 0],
        'mcv' => ['MCV', 'fL', null, 1],
        'mchc' => ['MCHC', 'g/dL', null, 1],
        'sr_iron' => ['Serum Iron', 'µmol/L', [10.6, 28.3], 1],
        'tibc' => ['TIBC', 'µmol/L', [44, 75], 1],
        'transferrin_ratio' => ['Transferrin Ratio', '%', [20, null], 1],
        'sr_ferritin' => ['Serum Ferritin', 'µg/L', null, 1],
    ];

    /** Core metrics surfaced as dashboard tiles. */
    private const DASHBOARD = [
        'egfr', 'creatinine', 'bun', 'uacr', 'potassium', 'phosphorus',
        'systolic_bp', 'diastolic_bp', 'weight',
    ];

    public function label(): string
    {
        return self::META[$this->value][0];
    }

    public function unit(): string
    {
        return self::META[$this->value][1];
    }

    /** General adult reference range [low, high], or null if not applicable. */
    public function referenceRange(): ?array
    {
        return self::META[$this->value][2];
    }

    /** Decimal places sensible for display/entry. */
    public function precision(): int
    {
        return self::META[$this->value][3];
    }

    /** Whether this metric appears as a dashboard tile. */
    public function onDashboard(): bool
    {
        return in_array($this->value, self::DASHBOARD, true);
    }

    /**
     * SI-unit display info: [unit, factor (conventional × factor), precision].
     * Only the US-conventional metrics convert; the rest already use SI units.
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
            self::Potassium => [3.0, 6.0],
            self::Egfr => [15, null],
            self::SystolicBp => [null, 180],
            self::DiastolicBp => [null, 120],
            self::Phosphorus => [null, 7.0],
            self::Sodium => [120, 160],
            self::Calcium => [1.7, 3.2],
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
