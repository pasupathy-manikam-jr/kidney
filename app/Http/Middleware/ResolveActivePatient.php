<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveActivePatient
{
    /**
     * Route names still allowed while viewing another patient (read-only).
     */
    private const WRITE_ALLOWLIST = ['shared.view', 'shared.exit', 'logout'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Default: the active patient is the user themselves.
        $request->attributes->set('patient', $user);
        $request->attributes->set('viewing', false);

        $viewingId = $request->session()->get('viewing_patient_id');

        if ($user && $viewingId && $viewingId !== $user->id) {
            $share = $user->patientShares()->where('patient_id', $viewingId)->first();

            if ($share) {
                $patient = User::find($viewingId);
                if ($patient) {
                    $request->attributes->set('patient', $patient);
                    $request->attributes->set('viewing', true);

                    // Block any write while in read-only caregiver view.
                    if (
                        ! in_array($request->method(), ['GET', 'HEAD'], true)
                        && ! in_array($request->route()?->getName(), self::WRITE_ALLOWLIST, true)
                    ) {
                        abort(403, 'Read-only: you are viewing shared data.');
                    }
                } else {
                    $request->session()->forget('viewing_patient_id');
                }
            } else {
                // Share was revoked — drop the view.
                $request->session()->forget('viewing_patient_id');
            }
        }

        return $next($request);
    }
}
