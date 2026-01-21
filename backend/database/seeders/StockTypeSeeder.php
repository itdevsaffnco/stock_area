<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $types = [
            'Penjualan',
            'Pengiriman',
            'Retur',
            'Tester',
            'Transfer Barang',
        ];

        foreach ($types as $type) {
            DB::table('stock_types')->updateOrInsert(
                ['name' => $type],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
