<?php

namespace App\Models;

use App\Enums\LabMetric;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property LabMetric $metric
 * @property string $value
 * @property string $unit
 * @property CarbonImmutable $measured_at
 * @property string|null $note
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class LabResult extends Model
{
    protected $fillable = [
        'metric',
        'value',
        'unit',
        'measured_at',
        'note',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metric' => LabMetric::class,
            'value' => 'decimal:2',
            'measured_at' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
