<?php

namespace Database\Seeders;

use App\Enums\LabMetric;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds a clearly-labelled DEMO account with ~6 months of realistic (but
 * fictional) readings so the dashboard shows a full picture for a walkthrough.
 * Real users should register their own account — this data is fake.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo Patient',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $user->labResults()->delete();

        // 7 monthly checkpoints, oldest -> newest. Fictional CKD picture:
        // eGFR gently declining into G3b, UACR rising into A2.
        $series = [
            LabMetric::Egfr->value => [52, 50, 49, 46, 44, 43, 41],
            LabMetric::Creatinine->value => [1.5, 1.6, 1.6, 1.7, 1.8, 1.8, 1.9],
            LabMetric::Bun->value => [24, 25, 26, 27, 28, 29, 30],
            LabMetric::Uacr->value => [45, 60, 80, 95, 110, 130, 150],
            LabMetric::Potassium->value => [4.6, 4.8, 5.0, 5.1, 5.2, 5.0, 5.3],
            LabMetric::Phosphorus->value => [3.8, 4.0, 4.2, 4.4, 4.6, 4.5, 4.8],
            LabMetric::SystolicBp->value => [138, 142, 140, 145, 148, 144, 150],
            LabMetric::DiastolicBp->value => [86, 88, 87, 90, 92, 89, 93],
            LabMetric::Weight->value => [78, 77.5, 78.2, 77, 76.5, 76, 75.4],
        ];

        $base = Carbon::create(2026, 1, 15);

        foreach ($series as $metric => $values) {
            $unit = LabMetric::from($metric)->unit();
            foreach ($values as $i => $value) {
                $user->labResults()->create([
                    'metric' => $metric,
                    'value' => $value,
                    'unit' => $unit,
                    'measured_at' => $base->copy()->addMonths($i),
                ]);
            }
        }

        // Fictional medication list for the walkthrough.
        $user->medications()->delete();
        $meds = [
            ['name' => 'Amlodipine', 'dosage' => '5 mg', 'frequency' => 'Once daily', 'time_of_day' => 'Morning', 'reminder_time' => '08:00', 'notes' => 'For blood pressure'],
            ['name' => 'Furosemide', 'dosage' => '20 mg', 'frequency' => 'Once daily', 'time_of_day' => 'Morning', 'notes' => 'Diuretic'],
            ['name' => 'Sevelamer', 'dosage' => '800 mg', 'frequency' => 'Three times daily', 'time_of_day' => 'With meals', 'notes' => 'Phosphate binder'],
            ['name' => 'Atorvastatin', 'dosage' => '20 mg', 'frequency' => 'Once daily', 'time_of_day' => 'Evening', 'notes' => null],
        ];
        foreach ($meds as $med) {
            $user->medications()->create([...$med, 'active' => true]);
        }

        // Fictional diet & fluid log for today and yesterday.
        $user->intakeEntries()->delete();
        $intake = [
            ['category' => 'fluid', 'amount' => 250, 'unit' => 'mL', 'label' => 'Water', 'daysAgo' => 0],
            ['category' => 'fluid', 'amount' => 200, 'unit' => 'mL', 'label' => 'Coffee', 'daysAgo' => 0],
            ['category' => 'fluid', 'amount' => 300, 'unit' => 'mL', 'label' => 'Soup', 'daysAgo' => 0],
            ['category' => 'sodium', 'amount' => 600, 'unit' => 'mg', 'label' => 'Lunch', 'daysAgo' => 0],
            ['category' => 'potassium', 'amount' => 450, 'unit' => 'mg', 'label' => 'Banana', 'daysAgo' => 0],
            ['category' => 'fluid', 'amount' => 900, 'unit' => 'mL', 'label' => 'Through the day', 'daysAgo' => 1],
            ['category' => 'phosphorus', 'amount' => 300, 'unit' => 'mg', 'label' => 'Dairy', 'daysAgo' => 1],
        ];
        foreach ($intake as $e) {
            $user->intakeEntries()->create([
                'category' => $e['category'],
                'amount' => $e['amount'],
                'unit' => $e['unit'],
                'label' => $e['label'],
                'logged_on' => now()->subDays($e['daysAgo'])->toDateString(),
            ]);
        }

        // Fictional symptom journal.
        $user->symptomEntries()->delete();
        $symptoms = [
            ['symptom' => 'Fatigue', 'severity' => 3, 'note' => 'Afternoons', 'daysAgo' => 0],
            ['symptom' => 'Swelling', 'severity' => 2, 'note' => 'Ankles', 'daysAgo' => 1],
            ['symptom' => 'Itching', 'severity' => 2, 'note' => null, 'daysAgo' => 3],
            ['symptom' => 'Cramps', 'severity' => 4, 'note' => 'Night', 'daysAgo' => 5],
        ];
        foreach ($symptoms as $s) {
            $user->symptomEntries()->create([
                'symptom' => $s['symptom'],
                'severity' => $s['severity'],
                'note' => $s['note'],
                'logged_on' => now()->subDays($s['daysAgo'])->toDateString(),
            ]);
        }

        // Fictional peritoneal dialysis catheter + exchange log.
        $user->catheters()->delete();
        $user->catheters()->create([
            'brand' => 'Covidien',
            'catheter_type' => 'Tenckhoff coiled',
            'inserted_on' => now()->subMonths(8)->toDateString(),
            'transfer_set_changed_on' => now()->subMonths(5)->subDays(20)->toDateString(),
            'transfer_set_interval_months' => 6,
            'notes' => 'PD catheter, exit site on left abdomen.',
        ]);

        // Fictional upcoming appointments.
        $user->appointments()->delete();
        $user->appointments()->create([
            'title' => 'Nephrology clinic',
            'scheduled_for' => now()->addDays(9)->toDateString(),
            'time_of_day' => '10:00',
            'location' => 'City Renal Unit',
            'notes' => 'Bring the printed report.',
        ]);
        $user->appointments()->create([
            'title' => 'Monthly blood test',
            'scheduled_for' => now()->addDays(2)->toDateString(),
            'time_of_day' => '08:30',
            'location' => 'Lab',
        ]);

        $user->catheterLogs()->delete();
        $exchanges = [
            ['daysAgo' => 0, 'fill' => 2000, 'drain' => 2300, 'color' => 'pale_yellow', 'note' => 'Morning exchange'],
            ['daysAgo' => 1, 'fill' => 2000, 'drain' => 2250, 'color' => 'clear', 'note' => null],
            ['daysAgo' => 2, 'fill' => 2000, 'drain' => 1950, 'color' => 'pale_yellow', 'note' => 'Low output'],
            ['daysAgo' => 3, 'fill' => 2000, 'drain' => 2280, 'color' => 'clear', 'note' => null],
        ];
        foreach ($exchanges as $e) {
            $user->catheterLogs()->create([
                'logged_on' => now()->subDays($e['daysAgo'])->toDateString(),
                'fill_volume' => $e['fill'],
                'drain_volume' => $e['drain'],
                'effluent_color' => $e['color'],
                'notes' => $e['note'],
            ]);
        }
    }
}
