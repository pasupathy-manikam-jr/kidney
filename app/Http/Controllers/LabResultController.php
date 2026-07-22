<?php

namespace App\Http\Controllers;

use App\Enums\LabMetric;
use App\Models\LabResult;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LabResultController extends Controller
{
    public function index(Request $request): Response
    {
        $results = $request->user()
            ->labResults()
            ->orderByDesc('measured_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('lab-results/index', [
            'results' => $results,
            'catalog' => LabMetric::catalog(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'metric' => ['required', Rule::enum(LabMetric::class)],
            'value' => ['required', 'numeric', 'min:0', 'max:999999'],
            'measured_at' => ['required', 'date', 'before_or_equal:today'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $metric = LabMetric::from($validated['metric']);

        $request->user()->labResults()->create([
            ...$validated,
            'unit' => $metric->unit(), // authoritative unit from catalog, not client
        ]);

        return back()->with('status', 'Lab result saved.');
    }

    public function update(Request $request, LabResult $labResult): RedirectResponse
    {
        abort_unless($labResult->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'metric' => ['required', Rule::enum(LabMetric::class)],
            'value' => ['required', 'numeric', 'min:0', 'max:999999'],
            'measured_at' => ['required', 'date', 'before_or_equal:today'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $metric = LabMetric::from($validated['metric']);

        $labResult->update([
            ...$validated,
            'unit' => $metric->unit(), // authoritative unit from catalog, not client
        ]);

        return back()->with('status', 'Lab result updated.');
    }

    public function destroy(Request $request, LabResult $labResult): RedirectResponse
    {
        abort_unless($labResult->user_id === Auth::id(), 403);

        $labResult->delete();

        return back()->with('status', 'Lab result deleted.');
    }
}
