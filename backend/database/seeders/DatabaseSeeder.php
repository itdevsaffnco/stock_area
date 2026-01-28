<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('saffnco'),
            'role' => 'admin' // Assuming role column exists from user description/migration
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('saffnco'),
            'role' => 'staff'
        ]);

        // Products (SKUs)
        $products = [
            ['sku_code' => 'SKU001', 'sku_name' => 'Product A 100ml', 'ml' => '100', 'category' => 'Cat A', 'pricing_rsp' => 50000],
            ['sku_code' => 'SKU002', 'sku_name' => 'Product B 200ml', 'ml' => '200', 'category' => 'Cat B', 'pricing_rsp' => 75000],
            ['sku_code' => 'SKU003', 'sku_name' => 'Product C 50ml', 'ml' => '50', 'category' => 'Cat A', 'pricing_rsp' => 25000],
        ];

        foreach ($products as $prod) {
            Product::create($prod);
        }

        // Stores (Waterfall Data)
        // Province -> SubChannel -> Channel -> Store
        $locations = [
            [
                'province' => 'Jawa Barat',
                'sub_channel' => 'Modern Trade',
                'channel' => 'Supermarket',
                'stores' => ['Superindo Dago', 'Yogya Riau']
            ],
            [
                'province' => 'Jawa Barat',
                'sub_channel' => 'General Trade',
                'channel' => 'Warung',
                'stores' => ['Warung Asep', 'Toko Berkah']
            ],
            [
                'province' => 'DKI Jakarta',
                'sub_channel' => 'Modern Trade',
                'channel' => 'Minimarket',
                'stores' => ['Indomaret Sudirman', 'Alfamart Thamrin']
            ]
        ];

        foreach ($locations as $loc) {
            foreach ($loc['stores'] as $storeName) {
                Store::create([
                    'province' => $loc['province'],
                    'sub_channel' => $loc['sub_channel'],
                    'channel' => $loc['channel'],
                    'store_name' => $storeName
                ]);
            }
        }
    }
}
