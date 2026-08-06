<?php

namespace App\Http\Controllers;

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\LabMetric;
use App\Support\KdigoRisk;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $results = $this->patient($request)
            ->labResults()
            ->orderByDesc('measured_at')
            ->orderByDesc('id')
            ->get();

        // Group readings by metric (already sorted newest-first).
        $byMetric = $results->groupBy(fn ($r) => $r->metric->value);

        $tiles = array_map(function (LabMetric $metric) use ($byMetric) {
            $readings = $byMetric->get($metric->value, collect());
            $reading = $readings->first();
            $value = $reading ? (float) $reading->value : null;

            // Previous reading for delta + a small oldest->newest series for the sparkline.
            $previous = $readings->get(1);
            $spark = $readings->take(10)->reverse()->values()
                ->map(fn ($r) => ['v' => (float) $r->value])
                ->all();

            return [
                'metric' => $metric->value,
                'label' => $metric->label(),
                'unit' => $metric->unit(),
                'si' => $metric->si(),
                'referenceRange' => $metric->referenceRange(),
                'value' => $value,
                'previousValue' => $previous ? (float) $previous->value : null,
                'measuredAt' => $reading?->measured_at->toDateString(),
                'status' => $value !== null ? $metric->status($value) : 'empty',
                'spark' => $spark,
                'count' => $readings->count(),
            ];
        }, array_values(array_filter(LabMetric::cases(), fn (LabMetric $m) => $m->onDashboard())));

        // GFR category from the latest eGFR reading, if any.
        $latestEgfr = $byMetric->get(LabMetric::Egfr->value, collect())->first();
        $gfrCategory = null;
        $gfr = null;
        if ($latestEgfr) {
            $value = (float) $latestEgfr->value;
            $gfrCategory = GfrCategory::fromEgfr($value);
            $gfr = [
                'code' => $gfrCategory->value,
                'label' => $gfrCategory->label(),
                'range' => $gfrCategory->range(),
                'severity' => $gfrCategory->severity(),
                'egfr' => $value,
                'measuredAt' => $latestEgfr->measured_at->toDateString(),
            ];
        }

        // Albuminuria category from the latest UACR reading, if any.
        $latestUacr = $byMetric->get(LabMetric::Uacr->value, collect())->first();
        $albCategory = null;
        $albuminuria = null;
        if ($latestUacr) {
            $value = (float) $latestUacr->value;
            $albCategory = AlbuminuriaCategory::fromUacr($value);
            $albuminuria = [
                'code' => $albCategory->value,
                'label' => $albCategory->label(),
                'range' => $albCategory->range(),
                'uacr' => $value,
                'measuredAt' => $latestUacr->measured_at->toDateString(),
            ];
        }

        // KDIGO risk heat-map — needs both a GFR and an albuminuria category.
        $risk = null;
        if ($gfrCategory && $albCategory) {
            $level = KdigoRisk::level($gfrCategory, $albCategory);
            $risk = [
                'level' => $level,
                'label' => KdigoRisk::label($level),
                'gfrCode' => $gfrCategory->value,
                'albCode' => $albCategory->value,
                'grid' => KdigoRisk::grid(),
            ];
        }

        $user = $this->patient($request);

        $latestSymptom = $user->symptomEntries()
            ->orderByDesc('logged_on')
            ->orderByDesc('id')
            ->first();

        $catheter = $user->catheters()->latest('id')->first();
        $nextChange = $catheter?->nextTransferSetChange();

        $nextAppointment = $user->appointments()
            ->whereDate('scheduled_for', '>=', now()->toDateString())
            ->orderBy('scheduled_for')
            ->first();

        $summary = [
            'nextAppointment' => $nextAppointment ? [
                'title' => $nextAppointment->title,
                'date' => $nextAppointment->scheduled_for->toDateString(),
                'time' => $nextAppointment->time_of_day,
                'daysUntil' => (int) now()->startOfDay()->diffInDays($nextAppointment->scheduled_for, false),
            ] : null,
            'activeMedications' => $user->medications()->where('active', true)->count(),
            'transferSetDue' => $nextChange?->toDateString(),
            'transferSetDaysUntil' => $nextChange
                ? (int) now()->startOfDay()->diffInDays($nextChange, false)
                : null,
            'fluidToday' => (int) round($user->intakeEntries()
                ->where('category', \App\Enums\IntakeCategory::Fluid->value)
                ->whereDate('logged_on', now()->toDateString())
                ->sum('amount')),
            'fluidTarget' => $user->intakeTarget(\App\Enums\IntakeCategory::Fluid),
            'symptomsLogged' => $user->symptomEntries()->count(),
            'latestSymptom' => $latestSymptom ? [
                'symptom' => $latestSymptom->symptom,
                'severity' => $latestSymptom->severity,
                'loggedOn' => $latestSymptom->logged_on->toDateString(),
            ] : null,
        ];

        return Inertia::render('dashboard', [
            'tiles' => $tiles,
            'totalReadings' => $results->count(),
            'gfr' => $gfr,
            'albuminuria' => $albuminuria,
            'risk' => $risk,
            'summary' => $summary,
        ]);
    }
}
