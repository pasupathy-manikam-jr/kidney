<?php

namespace App\Http\Controllers;

use App\Mail\CareShareInvitation;
use App\Models\CareShare;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CareShareController extends Controller
{
    public function index(Request $request): Response
    {
        $shares = $request->user()
            ->caregiverShares()
            ->orderBy('caregiver_email')
            ->get()
            ->map(fn (CareShare $s) => [
                'id' => $s->id,
                'email' => $s->caregiver_email,
                'label' => $s->label,
                'accepted' => $s->accepted_at !== null,
            ]);

        return Inertia::render('sharing/index', [
            'shares' => $shares,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'caregiver_email' => [
                'required', 'email', 'max:255',
                Rule::notIn([$request->user()->email]), // can't share with yourself
            ],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $email = strtolower($validated['caregiver_email']);

        // If the invitee already has an account, link + accept immediately.
        $caregiver = User::whereRaw('lower(email) = ?', [$email])->first();

        $request->user()->caregiverShares()->updateOrCreate(
            ['caregiver_email' => $email],
            [
                'label' => $validated['label'] ?? null,
                'caregiver_id' => $caregiver?->id,
                'accepted_at' => $caregiver ? now() : null,
            ],
        );

        // Notify the caregiver by email (best-effort — never block the invite).
        try {
            Mail::to($email)->send(new CareShareInvitation(
                patientName: $request->user()->name,
                label: $validated['label'] ?? null,
                hasAccount: $caregiver !== null,
                actionUrl: $caregiver ? route('shared.index') : route('register'),
            ));
        } catch (\Throwable $e) {
            Log::warning('Care share invite email failed: '.$e->getMessage());

            return back()->with('status', 'Caregiver added, but the email could not be sent.');
        }

        return back()->with('status', 'Caregiver invited — an email is on its way.');
    }

    public function destroy(Request $request, CareShare $careShare): RedirectResponse
    {
        abort_unless($careShare->patient_id === Auth::id(), 403);

        $careShare->delete();

        return back()->with('status', 'Access removed.');
    }
}
