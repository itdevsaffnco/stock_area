<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Store;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\LowStockAlert;

class StockController extends Controller
{
    // Admin: Get all stocks with filters
    public function index(Request $request)
    {
        $query = Stock::with(['store', 'product', 'user']);

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }
        
        if ($request->has('province')) {
            $query->whereHas('store', function($q) use ($request) {
                $q->where('province', $request->province);
            });
        }

        // Get latest stock status per store+sku?
        // Or just list history? 
        // User asked: "showing stock data... filter based on stores"
        // Let's return latest state.
        // Actually, since our 'stocks' table has 'real_stock', we can just show the latest entry for each Store+SKU?
        // Or show all transactions?
        // Let's show all for now, ordered by date desc.
        
        return response()->json($query->latest()->get());
    }

    // Staff: Get current stock for a specific Store + SKU
    public function current(Request $request)
    {
        $request->validate([
            'store_id' => 'required',
            'sku_code' => 'required'
        ]);

        $latestStock = Stock::where('store_id', $request->store_id)
            ->where('sku_code', $request->sku_code)
            ->latest()
            ->first();

        return response()->json([
            'current_stock' => $latestStock ? $latestStock->real_stock : 0,
            'last_updated' => $latestStock ? $latestStock->created_at : null
        ]);
    }

    // Staff: Submit new stock transaction
    public function store(Request $request)
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'sku_code' => 'required|exists:products,sku_code',
            'stock_type' => 'required|string',
            'qty' => 'required|integer',
            'reason' => 'nullable|string',
            'destination_store_id' => 'nullable|exists:stores,id',
        ]);

        $user = $request->user();

        // Get previous stock
        $lastStock = Stock::where('store_id', $validated['store_id'])
            ->where('sku_code', $validated['sku_code'])
            ->latest()
            ->first();

        $currentRealStock = $lastStock ? $lastStock->real_stock : 0;
        $stockAwal = $lastStock ? $lastStock->real_stock : 0;
        
        $qty = $validated['qty'];
        $newRealStock = $currentRealStock;

        // Logic Mapping
        switch ($validated['stock_type']) {
            case 'Penjualan':
                $newRealStock -= $qty;
                break;
            case 'Pengiriman': // Inbound
            case 'Barang Masuk':
            case 'Adjustment': // Treated as Inbound based on user request
                $newRealStock += $qty;
                break;
            case 'Retur': // Outbound return
                $newRealStock -= $qty;
                break;
            case 'Tester': // Consumed
                $newRealStock -= $qty;
                break;
            case 'Transfer Barang': // Outbound transfer
                $newRealStock -= $qty;
                break;
            case 'Transfer Masuk': // Inbound transfer
                $newRealStock += $qty;
                break;
            default:
                break;
        }

        // Create new Stock Record (Transaction)
        // Auto-generate reason for Transfer Barang if empty
        $reason = $validated['reason'] ?? null;
        if ($validated['stock_type'] === 'Transfer Barang' && !empty($validated['destination_store_id'])) {
            $destStoreName = Store::find($validated['destination_store_id'])->store_name;
            $reason = $reason ?: "Transfer ke $destStoreName";
        }

        $stock = Stock::create([
            'store_id' => $validated['store_id'],
            'user_id' => $user->id,
            'sku_code' => $validated['sku_code'],
            'stock_type' => $validated['stock_type'],
            'reason' => $reason,
            'destination_store_id' => $validated['destination_store_id'] ?? null,
            'stock_awal' => $stockAwal,
            'real_stock' => $newRealStock,
            'recent_stock' => $qty,
            'total_sales' => ($validated['stock_type'] == 'Penjualan') ? ($lastStock ? $lastStock->total_sales + $qty : $qty) : ($lastStock ? $lastStock->total_sales : 0),
        ]);

        // Handle Automatic Destination Entry for Transfer Barang
        if ($validated['stock_type'] === 'Transfer Barang' && !empty($validated['destination_store_id'])) {
            $destStoreId = $validated['destination_store_id'];
            
            // Get last stock for destination
            $lastDestStock = Stock::where('store_id', $destStoreId)
                ->where('sku_code', $validated['sku_code'])
                ->latest()
                ->first();

            $destStockAwal = $lastDestStock ? $lastDestStock->real_stock : 0;
            $destNewRealStock = $destStockAwal + $qty;

            // Get Source Store Name
            $sourceStoreName = Store::find($validated['store_id'])->store_name;

            Stock::create([
                'store_id' => $destStoreId,
                'user_id' => $user->id,
                'sku_code' => $validated['sku_code'],
                'stock_type' => 'Transfer Masuk',
                'reason' => "Transfer dari $sourceStoreName",
                'destination_store_id' => null, 
                'stock_awal' => $destStockAwal,
                'real_stock' => $destNewRealStock,
                'recent_stock' => $qty,
                'total_sales' => $lastDestStock ? $lastDestStock->total_sales : 0,
            ]);
        }

        // Check for Low Stock Alert (< 12)
        if ($newRealStock < 12) {
            try {
                $storeName = Store::find($validated['store_id'])->store_name;
                $productName = Product::where('sku_code', $validated['sku_code'])->value('sku_name');
                
                // Send email to admin (configure MAIL_FROM_ADDRESS in .env)
                // Sending to a default admin email
                Mail::to('yodi@saffnco.com')->send(new LowStockAlert($productName, $storeName, $newRealStock));
            } catch (\Exception $e) {
                // Fail silently or log error if mail configuration is missing
            }
        }

        return response()->json([
            'message' => 'Stock updated successfully',
            'data' => $stock
        ]);
    }
}
