<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = ['inventory_id', 'user_id', 'movement_type', 'quantity', 'reason'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3'];
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
