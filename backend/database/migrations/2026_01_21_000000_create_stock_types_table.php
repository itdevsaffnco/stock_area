<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stock_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Seed initial data
        DB::table('stock_types')->insert([
            ['name' => 'Penjualan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pengiriman', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Retur', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tester', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Transfer Barang', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('stock_types');
    }
};
