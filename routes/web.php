<?php

use App\Enums\AlbuminuriaCategory;
use App\Enums\GfrCategory;
use App\Enums\LabMetric;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\ReportController;
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

    Route::get('report', [ReportController::class, 'index'])->name('report');

    Route::get('reference', fn () => Inertia\Inertia::render('reference', [
        'metrics' => LabMetric::catalog(),
        'gfrCategories' => GfrCategory::catalog(),
        'albuminuriaCategories' => AlbuminuriaCategory::catalog(),
        'riskGrid' => KdigoRisk::grid(),
    ]))->name('reference');
});

require __DIR__.'/settings.php';
