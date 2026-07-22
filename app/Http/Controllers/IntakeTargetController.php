<?php

namespace App\Http\Controllers;

use App\Enums\IntakeCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class IntakeTargetController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $rules = [];
        foreach (IntakeCategory::cases() as $c) {
            $rules[$c->value] = ['nullable', 'integer', 'min:1', 'max:100000'];
        }

        $validated = $request->validate($rules);

        // Keep only the values the user actually set; blanks fall back to the
        // general suggested limit at read time.
        $targets = array_filter(
            $validated,
            fn ($v) => $v !== null && $v !== '',
        );

        $request->user()->update(['intake_targets' => $targets ?: null]);

        return back()->with('status', 'Targets updated.');
    }
}
