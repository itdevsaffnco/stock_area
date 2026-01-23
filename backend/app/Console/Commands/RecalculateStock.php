<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;

class RecalculateStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:recalculate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate real_stock for all transactions based on chronological order';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Starting stock recalculation...');

        // Get unique Store + SKU combinations
        $combinations = Stock::select('store_id', 'sku_code')
            ->distinct()
            ->get();

        $bar = $this->output->createProgressBar(count($combinations));

        foreach ($combinations as $combo) {
            $transactions = Stock::where('store_id', $combo->store_id)
                ->where('sku_code', $combo->sku_code)
                ->orderBy('id', 'asc') // Assuming ID matches chronological insertion
                ->get();

            $currentStock = 0;

            foreach ($transactions as $tx) {
                $qty = $tx->recent_stock; // 'recent_stock' holds the transaction qty
                
                // Logic must match StockController
                switch ($tx->stock_type) {
                    case 'Penjualan':
                    case 'Retur':
                    case 'Tester':
                    case 'Transfer Barang':
                        $currentStock -= $qty;
                        break;
                    case 'Pengiriman':
                    case 'Barang Masuk':
                    case 'Adjustment':
                    case 'Transfer Masuk':
                        $currentStock += $qty;
                        break;
                    default:
                        // No change or handle unknown types
                        break;
                }

                // Update the record if needed
                if ($tx->real_stock != $currentStock) {
                    $tx->real_stock = $currentStock;
                    $tx->save();
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Stock recalculation completed.');

        return 0;
    }
}
