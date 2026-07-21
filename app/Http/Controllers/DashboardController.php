<?php

namespace App\Http\Controllers;

use App\Enums\LabMetric;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $results = $request->user()
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
                'referenceRange' => $metric->referenceRange(),
                'value' => $value,
                'previousValue' => $previous ? (float) $previous->value : null,
                'measuredAt' => $reading?->measured_at->toDateString(),
                'status' => $value !== null ? $metric->status($value) : 'empty',
                'spark' => $spark,
                'count' => $readings->count(),
            ];
        }, LabMetric::cases());

        return Inertia::render('dashboard', [
            'tiles' => $tiles,
            'totalReadings' => $results->count(),
        ]);
    }
}
