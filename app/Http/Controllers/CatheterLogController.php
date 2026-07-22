<?php

namespace App\Http\Controllers;

use App\Enums\EffluentColor;
use App\Models\CatheterLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CatheterLogController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'logged_on' => ['required', 'date', 'before_or_equal:today'],
            'fill_volume' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'drain_volume' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'effluent_color' => ['nullable', Rule::enum(EffluentColor::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $request->user()->catheterLogs()->create($validated);

        return back()->with('status', 'Exchange logged.');
    }

    public function destroy(Request $request, CatheterLog $catheterLog): RedirectResponse
    {
        abort_unless($catheterLog->user_id === Auth::id(), 403);

        $catheterLog->delete();

        return back()->with('status', 'Entry removed.');
    }
}
