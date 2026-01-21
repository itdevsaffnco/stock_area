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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('sku_code');
            $table->foreign('sku_code')->references('sku_code')->on('products')->onDelete('cascade');
            
            $table->string('stock_type')->nullable(); // Penjualan, Pengiriman, etc.
            
            $table->integer('stock_awal')->default(0);
            $table->integer('soh_value')->default(0);
            $table->integer('real_stock')->default(0); // Current stock after transaction
            $table->integer('ned')->default(0);
            $table->integer('tester')->default(0);
            $table->integer('return')->default(0);
            $table->integer('transfer_barang')->default(0);
            $table->integer('restock')->default(0);
            $table->integer('recent_stock')->default(0); // Input qty
            $table->integer('total_sales')->default(0);
            $table->integer('final_stock_fisik')->default(0);
            $table->decimal('sales_value', 15, 2)->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
