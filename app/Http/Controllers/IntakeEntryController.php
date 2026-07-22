<?php

namespace App\Http\Controllers;

use App\Enums\IntakeCategory;
use App\Models\IntakeEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IntakeEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = $request->user()
            ->intakeEntries()
            ->orderByDesc('logged_on')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return Inertia::render('intake/index', [
            'entries' => $entries,
            'catalog' => IntakeCategory::catalog(),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', Rule::enum(IntakeCategory::class)],
            'amount' => ['required', 'numeric', 'min:0', 'max:99999'],
            'label' => ['nullable', 'string', 'max:255'],
            'logged_on' => ['required', 'date', 'before_or_equal:today'],
        ]);

        $category = IntakeCategory::from($validated['category']);

        $request->user()->intakeEntries()->create([
            ...$validated,
            'unit' => $category->unit(),
        ]);

        return back()->with('status', 'Entry logged.');
    }

    public function destroy(Request $request, IntakeEntry $intakeEntry): RedirectResponse
    {
        abort_unless($intakeEntry->user_id === Auth::id(), 403);

        $intakeEntry->delete();

        return back()->with('status', 'Entry removed.');
    }
}
