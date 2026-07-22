<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:1024'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'timezone' => ['nullable', 'timezone'],
        ]);

        $request->user()->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'public_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
            ],
        );

        // Remember the browser's timezone so time-of-day reminders fire locally.
        if (! empty($validated['timezone'])) {
            $request->user()->update(['timezone' => $validated['timezone']]);
        }

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $endpoint = $request->input('endpoint');
        if ($endpoint) {
            $request->user()->pushSubscriptions()->where('endpoint', $endpoint)->delete();
        }

        return response()->json(['ok' => true]);
    }
}
