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
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('shift_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['in', 'out']);
            $table->enum('category', ['income', 'deposit', 'expense', 'withdrawal', 'other']);
            $table->decimal('amount', 18, 2);
            $table->string('description');
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->timestamps();

            $table->index('shift_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
