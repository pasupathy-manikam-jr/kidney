<?php

namespace App\Http\Controllers;

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\IntakeCategory;
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
                'si' => $metric->si(),
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
                'si' => $r->metric->si(),
                'measuredAt' => $r->measured_at->toDateString(),
                'note' => $r->note,
            ])->values(),
            'medications' => $user->medications()
                ->where('active', true)
                ->orderBy('name')
                ->get()
                ->map(fn ($m) => [
                    'name' => $m->name,
                    'dosage' => $m->dosage,
                    'frequency' => $m->frequency,
                    'timeOfDay' => $m->time_of_day,
                ])->values(),
            'intakeToday' => collect(IntakeCategory::cases())->map(function ($c) use ($user) {
                $total = (float) $user->intakeEntries()
                    ->where('category', $c->value)
                    ->whereDate('logged_on', now()->toDateString())
                    ->sum('amount');

                return [
                    'label' => $c->label(),
                    'unit' => $c->unit(),
                    'total' => round($total),
                    'target' => $user->intakeTarget($c),
                ];
            })->values(),
            'symptoms' => $user->symptomEntries()
                ->orderByDesc('logged_on')
                ->orderByDesc('id')
                ->limit(15)
                ->get()
                ->map(fn ($s) => [
                    'symptom' => $s->symptom,
                    'severity' => $s->severity,
                    'note' => $s->note,
                    'loggedOn' => $s->logged_on->toDateString(),
                ])->values(),
            'dialysis' => (function () use ($user) {
                $catheter = $user->catheters()->latest('id')->first();
                if (! $catheter) {
                    return null;
                }

                return [
                    'brand' => $catheter->brand,
                    'type' => $catheter->catheter_type,
                    'nextTransferSetChange' => $catheter->nextTransferSetChange()?->toDateString(),
                    'exchanges' => $user->catheterLogs()
                        ->orderByDesc('logged_on')->orderByDesc('id')->limit(7)->get()
                        ->map(fn ($l) => [
                            'loggedOn' => $l->logged_on->toDateString(),
                            'fill' => $l->fill_volume,
                            'drain' => $l->drain_volume,
                            'uf' => $l->ultrafiltration(),
                            'color' => $l->effluent_color?->label(),
                        ])->values(),
                ];
            })(),
        ]);
    }
}
