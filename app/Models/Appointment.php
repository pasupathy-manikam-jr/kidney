<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'title',
        'scheduled_for',
        'time_of_day',
        'location',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_for' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
