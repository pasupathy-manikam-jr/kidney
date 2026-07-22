<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MedicationController extends Controller
{
    public function index(Request $request): Response
    {
        $medications = $request->user()
            ->medications()
            ->orderByDesc('active')
            ->orderBy('name')
            ->get();

        return Inertia::render('medications/index', [
            'medications' => $medications,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->user()->medications()->create($this->validated($request));

        return back()->with('status', 'Medication added.');
    }

    public function update(Request $request, Medication $medication): RedirectResponse
    {
        abort_unless($medication->user_id === Auth::id(), 403);

        $medication->update($this->validated($request));

        return back()->with('status', 'Medication updated.');
    }

    public function destroy(Request $request, Medication $medication): RedirectResponse
    {
        abort_unless($medication->user_id === Auth::id(), 403);

        $medication->delete();

        return back()->with('status', 'Medication removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:100'],
            'frequency' => ['nullable', 'string', 'max:100'],
            'time_of_day' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'active' => ['boolean'],
        ]);
    }
}
