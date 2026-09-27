<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $brand
 * @property string|null $catheter_type
 * @property CarbonImmutable|null $inserted_on
 * @property CarbonImmutable|null $transfer_set_changed_on
 * @property int $transfer_set_interval_months
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
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

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'inserted_on' => 'date:Y-m-d',
            'transfer_set_changed_on' => 'date:Y-m-d',
            'transfer_set_interval_months' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
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
