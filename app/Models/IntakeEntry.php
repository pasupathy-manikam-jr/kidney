<?php

namespace App\Models;

use App\Enums\IntakeCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntakeEntry extends Model
{
    protected $fillable = [
        'category',
        'amount',
        'unit',
        'label',
        'logged_on',
    ];

    protected function casts(): array
    {
        return [
            'category' => IntakeCategory::class,
            'amount' => 'decimal:1',
            'logged_on' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
