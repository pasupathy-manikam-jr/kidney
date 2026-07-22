<?php

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\LabMetric;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\CareShareController;
use App\Http\Controllers\CatheterController;
use App\Http\Controllers\CatheterLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DialysisController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\IntakeEntryController;
use App\Http\Controllers\IntakeTargetController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SharedController;
use App\Http\Controllers\SymptomEntryController;
use App\Support\KdigoRisk;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('guide', 'guide')->name('guide');

Route::middleware(['auth', 'verified', \App\Http\Middleware\ResolveActivePatient::class])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Caregiver sharing (patient side: invite/revoke).
    Route::get('sharing', [CareShareController::class, 'index'])->name('sharing.index');
    Route::post('sharing', [CareShareController::class, 'store'])->name('sharing.store');
    Route::delete('sharing/{careShare}', [CareShareController::class, 'destroy'])->name('sharing.destroy');

    // Caregiver side: patients who shared with me, enter/exit read-only view.
    Route::get('shared', [SharedController::class, 'index'])->name('shared.index');
    Route::post('shared/{careShare}/view', [SharedController::class, 'view'])->name('shared.view');
    Route::post('shared/exit', [SharedController::class, 'exit'])->name('shared.exit');

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

    Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::put('appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

    Route::put('appearance-prefs', [\App\Http\Controllers\AppearancePrefController::class, 'update'])->name('appearance-prefs.update');

    Route::post('push-subscriptions', [PushSubscriptionController::class, 'store'])->name('push-subscriptions.store');
    Route::delete('push-subscriptions', [PushSubscriptionController::class, 'destroy'])->name('push-subscriptions.destroy');

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
