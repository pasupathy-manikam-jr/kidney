<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Catheter extends Model
{
    protected $fillable = [
        'brand',
        'catheter_type',
        'inserted_on',
        'transfer_set_changed_on',
        'transfer_set_interval_months',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'inserted_on' => 'date:Y-m-d',
            'transfer_set_changed_on' => 'date:Y-m-d',
            'transfer_set_interval_months' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Date the next transfer-set change is due, or null if not enough info. */
    public function nextTransferSetChange(): ?CarbonInterface
    {
        if (! $this->transfer_set_changed_on) {
            return null;
        }

        return $this->transfer_set_changed_on->copy()
            ->addMonths($this->transfer_set_interval_months ?: 6);
    }
}
