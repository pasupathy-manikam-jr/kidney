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
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'profile' => [
                'age' => $request->user()->age,
                'sex' => $request->user()->sex,
            ],
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

        if ($alert = $metric->criticalMessage((float) $validated['value'])) {
            return back()->with('status', 'Lab result saved.')->with('alert', $alert);
        }

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

        if ($alert = $metric->criticalMessage((float) $validated['value'])) {
            return back()->with('status', 'Lab result updated.')->with('alert', $alert);
        }

        return back()->with('status', 'Lab result updated.');
    }

    public function destroy(Request $request, LabResult $labResult): RedirectResponse
    {
        abort_unless($labResult->user_id === Auth::id(), 403);

        $labResult->delete();

        return back()->with('status', 'Lab result deleted.');
    }

    public function export(Request $request): StreamedResponse
    {
        $results = $request->user()
            ->labResults()
            ->orderBy('measured_at')
            ->orderBy('id')
            ->get();

        $filename = 'kidney-lab-results-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($results) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['metric', 'value', 'unit', 'measured_at', 'note']);
            foreach ($results as $r) {
                fputcsv($out, [
                    $r->metric->value,
                    $r->value,
                    $r->unit,
                    $r->measured_at->toDateString(),
                    $r->note,
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        if ($handle === false) {
            return back()->with('error', 'Could not read the uploaded file.');
        }

        $header = fgetcsv($handle);
        $expected = ['metric', 'value', 'unit', 'measured_at', 'note'];
        if ($header === false || array_map('strtolower', array_map('trim', $header)) !== $expected) {
            fclose($handle);

            return back()->with('error', 'CSV header must be: '.implode(', ', $expected));
        }

        $imported = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count(array_filter($row, fn ($c) => trim((string) $c) !== '')) === 0) {
                continue; // blank line
            }

            [$metricRaw, $value, , $measuredAt, $note] = array_pad($row, 5, null);

            $metric = LabMetric::tryFrom(trim((string) $metricRaw));
            $valid = $metric
                && is_numeric($value)
                && (float) $value >= 0
                && strtotime((string) $measuredAt) !== false
                && strtotime((string) $measuredAt) <= strtotime('today 23:59:59');

            if (! $valid) {
                $skipped++;

                continue;
            }

            $request->user()->labResults()->create([
                'metric' => $metric->value,
                'value' => (float) $value,
                'unit' => $metric->unit(),
                'measured_at' => date('Y-m-d', strtotime((string) $measuredAt)),
                'note' => $note ? trim((string) $note) : null,
            ]);
            $imported++;
        }

        fclose($handle);

        return back()->with('status', "Imported {$imported} reading(s), skipped {$skipped}.");
    }
}
