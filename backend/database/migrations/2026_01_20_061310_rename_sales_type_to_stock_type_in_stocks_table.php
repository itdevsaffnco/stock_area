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
        if (Schema::hasColumn('stocks', 'sales_type')) {
            Schema::table('stocks', function (Blueprint $table) {
                $table->renameColumn('sales_type', 'stock_type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('stocks', 'stock_type')) {
            Schema::table('stocks', function (Blueprint $table) {
                $table->renameColumn('stock_type', 'sales_type');
            });
        }
    }
};
