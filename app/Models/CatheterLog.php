<?php

namespace App\Models;

use App\Enums\EffluentColor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatheterLog extends Model
{
    protected $fillable = [
        'logged_on',
        'fill_volume',
        'drain_volume',
        'effluent_color',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'logged_on' => 'date:Y-m-d',
            'fill_volume' => 'integer',
            'drain_volume' => 'integer',
            'effluent_color' => EffluentColor::class,
        ];
    }

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
