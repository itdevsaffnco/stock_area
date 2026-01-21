<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'province',
        'sub_channel',
        'channel',
        'store_name',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
}
