<?php

namespace App\Http\Controllers;

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\LabMetric;
use App\Support\KdigoRisk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $results = $user->labResults()
            ->orderByDesc('measured_at')
            ->orderByDesc('id')
            ->get();

        $byMetric = $results->groupBy(fn ($r) => $r->metric->value);

        // Latest value per metric.
        $latest = array_values(array_filter(array_map(function (LabMetric $metric) use ($byMetric) {
            $reading = $byMetric->get($metric->value, collect())->first();
            if (! $reading) {
                return null;
            }

            $value = (float) $reading->value;

            return [
                'metric' => $metric->value,
                'label' => $metric->label(),
                'unit' => $metric->unit(),
                'referenceRange' => $metric->referenceRange(),
                'value' => $value,
                'status' => $metric->status($value),
                'measuredAt' => $reading->measured_at->toDateString(),
            ];
        }, LabMetric::cases())));

        // GFR + albuminuria categories.
        $latestEgfr = $byMetric->get(LabMetric::Egfr->value, collect())->first();
        $latestUacr = $byMetric->get(LabMetric::Uacr->value, collect())->first();

        $gfrCategory = $latestEgfr ? GfrCategory::fromEgfr((float) $latestEgfr->value) : null;
        $albCategory = $latestUacr ? AlbuminuriaCategory::fromUacr((float) $latestUacr->value) : null;

        $risk = null;
        if ($gfrCategory && $albCategory) {
            $level = KdigoRisk::level($gfrCategory, $albCategory);
            $risk = ['level' => $level, 'label' => KdigoRisk::label($level)];
        }

        return Inertia::render('report', [
            'patientName' => $user->name,
            'generatedAt' => now()->toDayDateTimeString(),
            'totalReadings' => $results->count(),
            'latest' => $latest,
            'gfr' => $gfrCategory ? [
                'code' => $gfrCategory->value,
                'label' => $gfrCategory->label(),
                'egfr' => (float) $latestEgfr->value,
            ] : null,
            'albuminuria' => $albCategory ? [
                'code' => $albCategory->value,
                'label' => $albCategory->label(),
                'uacr' => (float) $latestUacr->value,
            ] : null,
            'risk' => $risk,
            'history' => $results->map(fn ($r) => [
                'metric' => $r->metric->label(),
                'value' => (float) $r->value,
                'unit' => $r->unit,
                'measuredAt' => $r->measured_at->toDateString(),
                'note' => $r->note,
            ])->values(),
        ]);
    }
}
