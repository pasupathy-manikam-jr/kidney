<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    private const VERSION = 1;

    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/data', [
            'counts' => [
                'labResults' => $user->labResults()->count(),
                'medications' => $user->medications()->count(),
                'intakeEntries' => $user->intakeEntries()->count(),
                'symptomEntries' => $user->symptomEntries()->count(),
                'catheterLogs' => $user->catheterLogs()->count(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();

        $data = [
            'version' => self::VERSION,
            'exported_at' => now()->toIso8601String(),
            'intake_targets' => $user->intake_targets,
            'emergency_contacts' => $user->emergency_contacts,
            'lab_results' => $user->labResults()->get(['metric', 'value', 'unit', 'measured_at', 'note']),
            'medications' => $user->medications()->get(['name', 'dosage', 'frequency', 'time_of_day', 'reminder_time', 'notes', 'active']),
            'intake_entries' => $user->intakeEntries()->get(['category', 'amount', 'unit', 'label', 'logged_on']),
            'symptom_entries' => $user->symptomEntries()->get(['symptom', 'severity', 'note', 'logged_on']),
            'catheters' => $user->catheters()->get(['brand', 'catheter_type', 'inserted_on', 'transfer_set_changed_on', 'transfer_set_interval_months', 'notes']),
            'catheter_logs' => $user->catheterLogs()->get(['logged_on', 'fill_volume', 'drain_volume', 'effluent_color', 'notes']),
        ];

        $filename = 'kidney-love-backup-'.now()->format('Y-m-d').'.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }, $filename, ['Content-Type' => 'application/json']);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json,txt', 'max:5120'],
        ]);

        $raw = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($raw, true);

        if (! is_array($data) || ($data['version'] ?? null) !== self::VERSION) {
            return back()->with('error', 'Unrecognised or incompatible backup file.');
        }

        $user = $request->user();

        DB::transaction(function () use ($user, $data) {
            // Replace collections wholesale.
            $user->labResults()->delete();
            foreach ($data['lab_results'] ?? [] as $r) {
                $user->labResults()->create($this->only($r, ['metric', 'value', 'unit', 'measured_at', 'note']));
            }

            $user->medications()->delete();
            foreach ($data['medications'] ?? [] as $r) {
                $user->medications()->create($this->only($r, ['name', 'dosage', 'frequency', 'time_of_day', 'reminder_time', 'notes', 'active']));
            }

            $user->intakeEntries()->delete();
            foreach ($data['intake_entries'] ?? [] as $r) {
                $user->intakeEntries()->create($this->only($r, ['category', 'amount', 'unit', 'label', 'logged_on']));
            }

            $user->symptomEntries()->delete();
            foreach ($data['symptom_entries'] ?? [] as $r) {
                $user->symptomEntries()->create($this->only($r, ['symptom', 'severity', 'note', 'logged_on']));
            }

            $user->catheters()->delete();
            foreach ($data['catheters'] ?? [] as $r) {
                $user->catheters()->create($this->only($r, ['brand', 'catheter_type', 'inserted_on', 'transfer_set_changed_on', 'transfer_set_interval_months', 'notes']));
            }

            $user->catheterLogs()->delete();
            foreach ($data['catheter_logs'] ?? [] as $r) {
                $user->catheterLogs()->create($this->only($r, ['logged_on', 'fill_volume', 'drain_volume', 'effluent_color', 'notes']));
            }

            $user->update([
                'intake_targets' => $data['intake_targets'] ?? null,
                'emergency_contacts' => $data['emergency_contacts'] ?? null,
            ]);
        });

        return back()->with('status', 'Backup restored.');
    }

    private function only(array $row, array $keys): array
    {
        return array_intersect_key($row, array_flip($keys));
    }
}
