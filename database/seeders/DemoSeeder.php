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
    }
}
