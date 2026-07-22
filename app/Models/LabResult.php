<?php

namespace App\Models;

use App\Enums\LabMetric;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabResult extends Model
{
    protected $fillable = [
        'metric',
        'value',
        'unit',
        'measured_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'metric' => LabMetric::class,
            'value' => 'decimal:2',
            'measured_at' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
