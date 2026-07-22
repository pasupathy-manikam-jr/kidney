<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AppearancePrefController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme' => ['required', 'in:default,teal,ocean,forest,sunset,contrast'],
            'text_size' => ['required', 'in:normal,large,xl'],
        ]);

        $request->user()->update($validated);

        return back();
    }
}
