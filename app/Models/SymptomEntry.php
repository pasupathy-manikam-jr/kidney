<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SymptomEntry extends Model
{
    protected $fillable = [
        'symptom',
        'severity',
        'note',
        'logged_on',
    ];

    protected function casts(): array
    {
        return [
            'severity' => 'integer',
            'logged_on' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
