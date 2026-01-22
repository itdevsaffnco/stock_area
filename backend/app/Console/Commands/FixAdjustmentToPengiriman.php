<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Stock;

class FixAdjustmentToPengiriman extends Command
{
    protected $signature = 'stock:fix-adjustment';
    protected $description = 'Update all stock entries with status Adjustment to Pengiriman';

    public function handle()
    {
        $this->info('Starting stock type update...');

        $count = Stock::where('stock_type', 'Adjustment')->count();
        
        if ($count === 0) {
            $this->info('No Adjustment entries found.');
            return 0;
        }

        $this->info("Found $count entries to update.");

        Stock::where('stock_type', 'Adjustment')->update(['stock_type' => 'Pengiriman']);

        $this->info('Update completed successfully.');
        return 0;
    }
}
