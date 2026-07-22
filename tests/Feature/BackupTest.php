<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;

test('export returns a JSON backup of the user data', function () {
    $user = User::factory()->create();
    $user->labResults()->create(['metric' => 'egfr', 'value' => 55, 'unit' => 'mL/min/1.73m²', 'measured_at' => '2026-06-01']);
    $user->medications()->create(['name' => 'Amlodipine', 'active' => true]);

    $response = $this->actingAs($user)->get('/settings/data/export');
    $response->assertOk();

    $json = json_decode($response->streamedContent(), true);
    expect($json['version'])->toBe(1)
        ->and($json['lab_results'])->toHaveCount(1)
        ->and($json['medications'][0]['name'])->toBe('Amlodipine');
});

test('import replaces the user data from a backup file', function () {
    $user = User::factory()->create();
    $user->labResults()->create(['metric' => 'egfr', 'value' => 10, 'unit' => 'x', 'measured_at' => '2026-01-01']);

    $backup = [
        'version' => 1,
        'intake_targets' => ['fluid' => 1200],
        'emergency_contacts' => null,
        'lab_results' => [
            ['metric' => 'potassium', 'value' => 4.5, 'unit' => 'mEq/L', 'measured_at' => '2026-05-01', 'note' => null],
        ],
        'medications' => [],
        'intake_entries' => [],
        'symptom_entries' => [],
        'catheters' => [],
        'catheter_logs' => [],
    ];

    $file = UploadedFile::fake()->createWithContent('backup.json', json_encode($backup));

    $this->actingAs($user)
        ->post('/settings/data/import', ['file' => $file])
        ->assertRedirect();

    $user->refresh();
    expect($user->labResults()->count())->toBe(1)
        ->and($user->labResults()->first()->metric->value)->toBe('potassium')
        ->and($user->intake_targets['fluid'])->toBe(1200);
});

test('import rejects an incompatible file', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->createWithContent('bad.json', json_encode(['version' => 99]));

    $this->actingAs($user)
        ->post('/settings/data/import', ['file' => $file])
        ->assertSessionHas('error');
});
