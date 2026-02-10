<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Store;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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
            case 'Request Stock':
                $newRealStock = $currentRealStock;
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
            'status' => ($validated['stock_type'] == 'Request Stock') ? 'Pending' : 'Completed',
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

    public function approve(Request $request, $id)
    {
        $validated = $request->validate([
            'approved_qty' => 'required|integer',
            'delivery_date' => 'required|date',
            'order_number' => 'required|string',
            'receipt_number' => 'required|string',
            'tracking_status' => 'required|string',
        ]);

        $stock = Stock::find($id);
        if (!$stock) {
            return response()->json(['message' => 'Stock request not found'], 404);
        }

        // Logic to add stock if status becomes 'Delivered' immediately upon approval
        if ($validated['tracking_status'] === 'Delivered' && $stock->tracking_status !== 'Delivered') {
            $lastStock = Stock::where('store_id', $stock->store_id)
                ->where('sku_code', $stock->sku_code)
                ->latest()
                ->first();

            $currentRealStock = $lastStock ? $lastStock->real_stock : 0;
            $qtyToAdd = $validated['approved_qty']; // Use the validated approved qty

            Stock::create([
                'store_id' => $stock->store_id,
                'user_id' => $request->user()->id ?? $stock->user_id,
                'sku_code' => $stock->sku_code,
                'stock_type' => 'Penerimaan Barang',
                'reason' => 'Penerimaan Request Stock #' . $stock->id,
                'stock_awal' => $currentRealStock,
                'real_stock' => $currentRealStock + $qtyToAdd,
                'recent_stock' => $qtyToAdd,
                'status' => 'Completed',
                'tracking_status' => 'Delivered',
                'order_number' => $validated['order_number'],
                'receipt_number' => $validated['receipt_number'],
            ]);
        }

        $stock->update([
            'status' => 'Approved',
            'approved_qty' => $validated['approved_qty'],
            'delivery_date' => $validated['delivery_date'],
            'order_number' => $validated['order_number'],
            'receipt_number' => $validated['receipt_number'],
            'tracking_status' => $validated['tracking_status'],
        ]);

        return response()->json(['message' => 'Stock request approved successfully', 'data' => $stock]);
    }

    public function updateTracking(Request $request, $id)
    {
        $validated = $request->validate([
            'tracking_status' => 'required|string',
        ]);

        $stock = Stock::find($id);
        if (!$stock) {
            return response()->json(['message' => 'Stock request not found'], 404);
        }

        // Logic to add stock if status becomes 'Delivered'
        // Check if it was NOT already delivered (to avoid duplicate increments)
        if ($validated['tracking_status'] === 'Delivered' && $stock->tracking_status !== 'Delivered') {
            
            // Get the absolute latest stock record for this store+sku to calculate the new running total
            $lastStock = Stock::where('store_id', $stock->store_id)
                ->where('sku_code', $stock->sku_code)
                ->latest()
                ->first();

            $currentRealStock = $lastStock ? $lastStock->real_stock : 0;
            // Use approved_qty if set, otherwise fallback to recent_stock (requested qty)
            $qtyToAdd = $stock->approved_qty ?? $stock->recent_stock;
            
            $newRealStock = $currentRealStock + $qtyToAdd;

            // Create a NEW ledger entry for the "Arrival" of goods
            Stock::create([
                'store_id' => $stock->store_id,
                'user_id' => $request->user()->id ?? $stock->user_id,
                'sku_code' => $stock->sku_code,
                'stock_type' => 'Penerimaan Barang', // Indicates stock arrival
                'reason' => 'Penerimaan Request Stock #' . $stock->id,
                'stock_awal' => $currentRealStock,
                'real_stock' => $newRealStock,
                'recent_stock' => $qtyToAdd,
                'status' => 'Completed',
                'tracking_status' => 'Delivered',
                'order_number' => $stock->order_number,
                'receipt_number' => $stock->receipt_number,
            ]);
        }

        $stock->update([
            'tracking_status' => $validated['tracking_status'],
        ]);

        return response()->json(['message' => 'Tracking status updated successfully', 'data' => $stock]);
    }

    public function downloadOpnameTemplate(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
        ]);

        $store = Store::find($request->store_id);
        $products = Product::all();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=stock_opname_" . Str::slug($store->store_name) . "_" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($store, $products) {
            $file = fopen('php://output', 'w');
            
            // Header
            fputcsv($file, ['Store Name', 'SKU Code', 'SKU Name', 'Category', 'System Stock', 'Physical Stock', 'Difference', 'Notes']);

            foreach ($products as $product) {
                // Get system stock
                $lastStock = Stock::where('store_id', $store->id)
                    ->where('sku_code', $product->sku_code)
                    ->latest()
                    ->first();
                
                $systemStock = $lastStock ? $lastStock->real_stock : 0;

                fputcsv($file, [
                    $store->store_name,
                    $product->sku_code,
                    $product->sku_name,
                    $product->category,
                    $systemStock,
                    '', // Physical Stock
                    '', // Difference
                    ''  // Notes
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
