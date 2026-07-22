<?php

namespace App\Http\Controllers;

use App\Models\SymptomEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SymptomEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = $this->patient($request)
            ->symptomEntries()
            ->orderByDesc('logged_on')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return Inertia::render('symptoms/index', [
            'entries' => $entries,
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->user()->symptomEntries()->create($this->validated($request));

        return back()->with('status', 'Symptom logged.');
    }

    public function destroy(Request $request, SymptomEntry $symptomEntry): RedirectResponse
    {
        abort_unless($symptomEntry->user_id === Auth::id(), 403);

        $symptomEntry->delete();

        return back()->with('status', 'Entry removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'symptom' => ['required', 'string', 'max:255'],
            'severity' => ['required', 'integer', 'min:1', 'max:5'],
            'note' => ['nullable', 'string', 'max:1000'],
            'logged_on' => ['required', 'date', 'before_or_equal:today'],
        ]);
    }
}
