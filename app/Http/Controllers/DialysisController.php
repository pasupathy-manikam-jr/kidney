<?php

namespace App\Http\Controllers;

use App\Enums\EffluentColor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DialysisController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $catheter = $user->catheters()->latest('id')->first();

        $nextChange = $catheter?->nextTransferSetChange();
        $daysUntil = $nextChange
            ? (int) now()->startOfDay()->diffInDays($nextChange, false)
            : null;

        $logs = $user->catheterLogs()
            ->orderByDesc('logged_on')
            ->orderByDesc('id')
            ->limit(60)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'logged_on' => $l->logged_on->toDateString(),
                'fill_volume' => $l->fill_volume,
                'drain_volume' => $l->drain_volume,
                'ultrafiltration' => $l->ultrafiltration(),
                'effluent_color' => $l->effluent_color?->value,
                'notes' => $l->notes,
            ]);

        return Inertia::render('dialysis/index', [
            'catheter' => $catheter ? [
                'brand' => $catheter->brand,
                'catheter_type' => $catheter->catheter_type,
                'inserted_on' => $catheter->inserted_on?->toDateString(),
                'transfer_set_changed_on' => $catheter->transfer_set_changed_on?->toDateString(),
                'transfer_set_interval_months' => $catheter->transfer_set_interval_months,
                'notes' => $catheter->notes,
            ] : null,
            'nextTransferSetChange' => $nextChange?->toDateString(),
            'daysUntilChange' => $daysUntil,
            'logs' => $logs,
            'colors' => EffluentColor::catalog(),
            'today' => now()->toDateString(),
        ]);
    }
}
