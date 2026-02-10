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
            $table->string('status')->default('Completed')->after('stock_type'); // Completed, Pending, Approved, Rejected
            $table->integer('approved_qty')->nullable()->after('recent_stock');
            $table->date('delivery_date')->nullable()->after('approved_qty');
            $table->string('order_number')->nullable()->after('delivery_date');
            $table->string('receipt_number')->nullable()->after('order_number');
            $table->string('tracking_status')->nullable()->after('receipt_number'); // Being Package, In Transit, Being Delivered, Delivered
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'approved_qty',
                'delivery_date',
                'order_number',
                'receipt_number',
                'tracking_status',
            ]);
        });
    }
};
