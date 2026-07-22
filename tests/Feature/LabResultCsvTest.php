<?php

use App\Models\LabResult;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('a user can export their lab results as CSV', function () {
    $user = User::factory()->create();
    $user->labResults()->create(['metric' => 'egfr', 'value' => 55, 'unit' => 'mL/min/1.73m²', 'measured_at' => '2026-06-01']);

    $response = $this->actingAs($user)->get('/lab-results/export');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $csv = $response->streamedContent();
    expect($csv)->toContain('metric,value,unit,measured_at,note')
        ->and($csv)->toContain('egfr,55')
        ->and($csv)->toContain('2026-06-01');
});

test('a user can import valid rows and invalid rows are skipped', function () {
    $user = User::factory()->create();

    $csv = "metric,value,unit,measured_at,note\n"
        ."egfr,60,mL/min/1.73m²,2026-05-01,fasting\n"
        ."potassium,4.5,mEq/L,2026-05-02,\n"
        ."not_a_metric,1,x,2026-05-03,\n"        // invalid metric
        ."egfr,abc,x,2026-05-04,\n";             // invalid value

    $file = UploadedFile::fake()->createWithContent('import.csv', $csv);

    $this->actingAs($user)
        ->post('/lab-results/import', ['file' => $file])
        ->assertRedirect();

    expect($user->labResults()->count())->toBe(2);
    $potassium = LabResult::where('metric', 'potassium')->first();
    expect($potassium->unit)->toBe('mEq/L'); // unit from catalog
});

test('import rejects a CSV with the wrong header', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->createWithContent('bad.csv', "foo,bar\n1,2\n");

    $this->actingAs($user)
        ->post('/lab-results/import', ['file' => $file])
        ->assertSessionHas('error');

    expect($user->labResults()->count())->toBe(0);
});
