<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $appointments = $this->patient($request)
            ->appointments()
            ->orderBy('scheduled_for')
            ->orderBy('id')
            ->get();

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->user()->appointments()->create($this->validated($request));

        return back()->with('status', 'Appointment added.');
    }

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        abort_unless($appointment->user_id === Auth::id(), 403);

        $appointment->update($this->validated($request));

        return back()->with('status', 'Appointment updated.');
    }

    public function destroy(Request $request, Appointment $appointment): RedirectResponse
    {
        abort_unless($appointment->user_id === Auth::id(), 403);

        $appointment->delete();

        return back()->with('status', 'Appointment removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'scheduled_for' => ['required', 'date'],
            'time_of_day' => ['nullable', 'string', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
