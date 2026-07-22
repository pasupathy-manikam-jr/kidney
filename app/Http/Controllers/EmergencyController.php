<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmergencyController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('emergency/index', [
            'contacts' => $request->user()->emergency_contacts ?? [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'contacts' => ['array', 'max:20'],
            'contacts.*.name' => ['nullable', 'string', 'max:255'],
            'contacts.*.role' => ['nullable', 'string', 'max:255'],
            'contacts.*.phone' => ['nullable', 'string', 'max:60'],
        ]);

        // Drop fully-empty rows.
        $contacts = array_values(array_filter(
            $validated['contacts'] ?? [],
            fn ($c) => trim(($c['name'] ?? '').($c['role'] ?? '').($c['phone'] ?? '')) !== '',
        ));

        $request->user()->update(['emergency_contacts' => $contacts ?: null]);

        return back()->with('status', 'Contacts saved.');
    }
}
