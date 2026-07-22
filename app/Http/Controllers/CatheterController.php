<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CatheterController extends Controller
{
    /** Upsert the user's catheter details (single latest record). */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand' => ['nullable', 'string', 'max:255'],
            'catheter_type' => ['nullable', 'string', 'max:255'],
            'inserted_on' => ['nullable', 'date', 'before_or_equal:today'],
            'transfer_set_changed_on' => ['nullable', 'date', 'before_or_equal:today'],
            'transfer_set_interval_months' => ['required', 'integer', 'min:1', 'max:24'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $catheter = $user->catheters()->latest('id')->first();

        if ($catheter) {
            $catheter->update($validated);
        } else {
            $user->catheters()->create($validated);
        }

        return back()->with('status', 'Catheter details saved.');
    }
}
