<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockType;

class UpdateStockTypesSeeder extends Seeder
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
            'Request Stock',
            'Stock Count',
            'Stock Opname'
        ];

        foreach ($types as $type) {
            StockType::firstOrCreate(['name' => $type]);
        }
    }
}
