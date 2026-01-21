<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku_code',
        'sku_name',
        'ml',
        'category',
        'status',
        'channel_distribution',
        'pricing_rsp',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'sku_code', 'sku_code');
    }
}
