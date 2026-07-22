<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('care_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->string('caregiver_email');
            $table->foreignId('caregiver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('label')->nullable(); // e.g. "PD nurse", "Daughter"
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['patient_id', 'caregiver_email']);
            $table->index('caregiver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('care_shares');
    }
};
