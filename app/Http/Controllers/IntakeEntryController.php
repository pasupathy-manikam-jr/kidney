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
        $entries = $this->patient($request)
            ->intakeEntries()
            ->orderByDesc('logged_on')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $user = $this->patient($request);

        // Effective target per category (user value or suggested fallback) and
        // the user's own set values (for the edit dialog).
        $targets = [];
        $customTargets = [];
        foreach (IntakeCategory::cases() as $c) {
            $targets[$c->value] = $user->intakeTarget($c);
            $customTargets[$c->value] = $user->intake_targets[$c->value] ?? null;
        }

        return Inertia::render('intake/index', [
            'entries' => $entries,
            'catalog' => IntakeCategory::catalog(),
            'targets' => $targets,
            'customTargets' => $customTargets,
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
