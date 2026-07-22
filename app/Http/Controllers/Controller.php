<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * The patient whose data should be shown: the logged-in user, or a patient
     * they are viewing read-only via a caregiver share (set by
     * ResolveActivePatient middleware). Use for READS only — writes always act
     * on the authenticated user and are blocked while viewing.
     */
    protected function patient(Request $request): User
    {
        return $request->attributes->get('patient') ?? $request->user();
    }
}
