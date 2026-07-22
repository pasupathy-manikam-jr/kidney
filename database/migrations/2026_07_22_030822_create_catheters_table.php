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
        Schema::create('catheters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('brand')->nullable();
            $table->string('catheter_type')->nullable(); // e.g. Tenckhoff straight / coiled
            $table->date('inserted_on')->nullable();
            $table->date('transfer_set_changed_on')->nullable();
            $table->unsignedSmallInteger('transfer_set_interval_months')->default(6);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catheters');
    }
};
