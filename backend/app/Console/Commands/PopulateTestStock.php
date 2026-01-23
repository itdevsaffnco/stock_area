<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use Illuminate\Support\Facades\Http;

class PopulateTestStock extends Command
{
    protected $signature = 'populate:test-stock';
    protected $description = 'Populate 10 random stock entries as a staff user via API';

    public function handle()
    {
        $this->info('Starting population script...');
        file_put_contents('populate.log', "Starting script...\n");

        // 1. Get Staff User
        $user = User::where('role', 'staff')->first();
        if (!$user) {
            $this->warn('No staff user found. Using first available user.');
            $user = User::first();
        }
        
        if (!$user) {
            $this->error('No users found in database.');
            return;
        }

        $this->info("Acting as user: {$user->email} ({$user->role})");

        // 2. Create Token
        $token = $user->createToken('populate-script')->plainTextToken;

        // 3. Prepare Data Sources
        $skus = \App\Models\Product::limit(5)->pluck('sku_code')->toArray();
        $storeIds = \App\Models\Store::limit(5)->pluck('id')->toArray();
        
        if (empty($skus) || empty($storeIds)) {
            $this->error('Not enough stores or products to generate data.');
            return;
        }

        $statuses = ['Barang Masuk', 'Penjualan', 'Pengiriman', 'Retur', 'Transfer Barang'];
        $baseUrl = 'http://127.0.0.1:8000';

        // 4. Loop 10 times
        for ($i = 1; $i <= 10; $i++) {
            $storeId = $storeIds[array_rand($storeIds)];
            $sku = $skus[array_rand($skus)];
            $status = $statuses[array_rand($statuses)];
            $qty = rand(5, 50);

            $data = [
                'store_id' => $storeId,
                'sku_code' => $sku,
                'stock_type' => $status,
                'qty' => $qty,
            ];

            if ($status === 'Transfer Barang') {
                // Pick a different store
                do {
                    $destId = $storeIds[array_rand($storeIds)];
                } while ($destId == $storeId);
                $data['destination_store_id'] = $destId;
            }

            $msg = "Entry $i: {$status} | Store: {$storeId} | SKU: {$sku} | Qty: $qty";
            $this->info($msg);
            file_put_contents('populate.log', $msg . "\n", FILE_APPEND);

            try {
                /** @var \Illuminate\Http\Client\Response $response */
                $response = Http::withToken($token)->timeout(5)->post("$baseUrl/api/stocks", $data);

                if ($response->successful()) {
                    $resMsg = "Success: " . ($response->json('message') ?? 'OK');
                    $this->info($resMsg);
                    file_put_contents('populate.log', "  $resMsg\n", FILE_APPEND);
                } else {
                    $resMsg = "Failed ({$response->status()}): " . $response->body();
                    $this->error($resMsg);
                    file_put_contents('populate.log', "  $resMsg\n", FILE_APPEND);
                }
            } catch (\Exception $e) {
                $resMsg = "Exception: " . $e->getMessage();
                $this->error($resMsg);
                file_put_contents('populate.log', "  $resMsg\n", FILE_APPEND);
            }
            
            usleep(200000); 
        }
        
        $this->info('Population script finished.');
        file_put_contents('populate.log', "Finished.\n", FILE_APPEND);
    }
}
