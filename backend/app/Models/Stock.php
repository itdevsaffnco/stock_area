<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'sku_code',
        'stock_type',
        'reason',
        'destination_store_id',
        'stock_awal',
        'soh_value',
        'real_stock',
        'ned',
        'tester',
        'return',
        'transfer_barang',
        'restock',
        'recent_stock',
        'total_sales',
        'final_stock_fisik',
        'sales_value',
        'status',
        'approved_qty',
        'delivery_date',
        'order_number',
        'receipt_number',
        'tracking_status',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'sku_code', 'sku_code');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
