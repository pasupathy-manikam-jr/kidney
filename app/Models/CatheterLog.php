<?php

namespace App\Models;

use App\Enums\EffluentColor;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property CarbonImmutable $logged_on
 * @property int|null $fill_volume
 * @property int|null $drain_volume
 * @property EffluentColor|null $effluent_color
 * @property string|null $notes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class CatheterLog extends Model
{
    protected $fillable = [
        'logged_on',
        'fill_volume',
        'drain_volume',
        'effluent_color',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'logged_on' => 'date:Y-m-d',
            'fill_volume' => 'integer',
            'drain_volume' => 'integer',
            'effluent_color' => EffluentColor::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Ultrafiltration = drain − fill (mL), or null if either is missing. */
    public function ultrafiltration(): ?int
    {
        if ($this->fill_volume === null || $this->drain_volume === null) {
            return null;
        }

        return $this->drain_volume - $this->fill_volume;
    }
}
