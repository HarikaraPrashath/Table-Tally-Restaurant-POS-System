<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';

    protected $fillable = ['product_id', 'current_stock', 'minimum_stock', 'unit'];

    protected function casts(): array
    {
        return ['current_stock' => 'decimal:3', 'minimum_stock' => 'decimal:3'];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
