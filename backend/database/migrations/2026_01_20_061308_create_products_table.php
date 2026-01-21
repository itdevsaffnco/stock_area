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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku_code')->unique();
            $table->string('sku_name');
            $table->string('ml')->nullable();
            $table->string('category')->nullable();
            $table->string('status')->nullable();
            $table->string('channel_distribution')->nullable();
            $table->decimal('pricing_rsp', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
