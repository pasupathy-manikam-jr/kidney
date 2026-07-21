<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabResultController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('lab-results', [LabResultController::class, 'index'])->name('lab-results.index');
    Route::post('lab-results', [LabResultController::class, 'store'])->name('lab-results.store');
    Route::delete('lab-results/{labResult}', [LabResultController::class, 'destroy'])->name('lab-results.destroy');
});

require __DIR__.'/settings.php';
