<?php

namespace App\Http\Controllers;

use App\Models\CareShare;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SharedController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Auto-accept any pending invitations addressed to this user's email.
        CareShare::whereNull('caregiver_id')
            ->whereRaw('lower(caregiver_email) = ?', [strtolower($user->email)])
            ->update(['caregiver_id' => $user->id, 'accepted_at' => now()]);

        $patients = $user->patientShares()
            ->with('patient:id,name,email')
            ->get()
            ->map(fn (CareShare $s) => [
                'shareId' => $s->id,
                'patientName' => $s->patient?->name,
                'patientEmail' => $s->patient?->email,
                'label' => $s->label,
            ]);

        return Inertia::render('shared/index', [
            'patients' => $patients,
        ]);
    }

    public function view(Request $request, CareShare $careShare): RedirectResponse
    {
        // Only the accepted caregiver on this share may enter the view.
        abort_unless(
            $careShare->caregiver_id === Auth::id() && $careShare->accepted_at !== null,
            403,
        );

        $request->session()->put('viewing_patient_id', $careShare->patient_id);

        return redirect()->route('dashboard');
    }

    public function exit(Request $request): RedirectResponse
    {
        $request->session()->forget('viewing_patient_id');

        return redirect()->route('shared.index');
    }
}
