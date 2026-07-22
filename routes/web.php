<?php

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\LabMetric;
use App\Http\Controllers\CatheterController;
use App\Http\Controllers\CatheterLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DialysisController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\IntakeEntryController;
use App\Http\Controllers\IntakeTargetController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SymptomEntryController;
use App\Support\KdigoRisk;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('guide', 'guide')->name('guide');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('lab-results', [LabResultController::class, 'index'])->name('lab-results.index');
    Route::get('lab-results/export', [LabResultController::class, 'export'])->name('lab-results.export');
    Route::post('lab-results/import', [LabResultController::class, 'import'])->name('lab-results.import');
    Route::post('lab-results', [LabResultController::class, 'store'])->name('lab-results.store');
    Route::put('lab-results/{labResult}', [LabResultController::class, 'update'])->name('lab-results.update');
    Route::delete('lab-results/{labResult}', [LabResultController::class, 'destroy'])->name('lab-results.destroy');

    Route::get('medications', [MedicationController::class, 'index'])->name('medications.index');
    Route::post('medications', [MedicationController::class, 'store'])->name('medications.store');
    Route::put('medications/{medication}', [MedicationController::class, 'update'])->name('medications.update');
    Route::delete('medications/{medication}', [MedicationController::class, 'destroy'])->name('medications.destroy');

    Route::get('intake', [IntakeEntryController::class, 'index'])->name('intake.index');
    Route::post('intake', [IntakeEntryController::class, 'store'])->name('intake.store');
    Route::delete('intake/{intakeEntry}', [IntakeEntryController::class, 'destroy'])->name('intake.destroy');
    Route::put('intake-targets', [IntakeTargetController::class, 'update'])->name('intake-targets.update');

    Route::get('symptoms', [SymptomEntryController::class, 'index'])->name('symptoms.index');
    Route::post('symptoms', [SymptomEntryController::class, 'store'])->name('symptoms.store');
    Route::delete('symptoms/{symptomEntry}', [SymptomEntryController::class, 'destroy'])->name('symptoms.destroy');

    Route::get('dialysis', [DialysisController::class, 'index'])->name('dialysis.index');
    Route::put('catheter', [CatheterController::class, 'update'])->name('catheter.update');
    Route::post('catheter-logs', [CatheterLogController::class, 'store'])->name('catheter-logs.store');
    Route::delete('catheter-logs/{catheterLog}', [CatheterLogController::class, 'destroy'])->name('catheter-logs.destroy');

    Route::get('emergency', [EmergencyController::class, 'index'])->name('emergency.index');
    Route::put('emergency-contacts', [EmergencyController::class, 'update'])->name('emergency-contacts.update');

    Route::get('report', [ReportController::class, 'index'])->name('report');

    Route::get('reference', fn () => Inertia\Inertia::render('reference', [
        'metrics' => LabMetric::catalog(),
        'gfrCategories' => GfrCategory::catalog(),
        'albuminuriaCategories' => AlbuminuriaCategory::catalog(),
        'riskGrid' => KdigoRisk::grid(),
    ]))->name('reference');
});

require __DIR__.'/settings.php';
