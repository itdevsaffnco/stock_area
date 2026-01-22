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
        Schema::table('stocks', function (Blueprint $table) {
            // Need doctrine/dbal for changing column type, but Laravel 10+ handles it natively mostly.
            // If it fails, I might need to install doctrine/dbal.
            // But let's try string()
            $table->string('stock_type', 255)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            // Reverting to enum might be tricky if data doesn't fit.
            // We'll leave it as string in down for safety, or try to revert.
            // Actually, we don't know the original enum values for sure (online/offline?), so better not force it back.
            // But for correctness:
            // $table->enum('stock_type', ['online', 'offline'])->change();
        });
    }
};
