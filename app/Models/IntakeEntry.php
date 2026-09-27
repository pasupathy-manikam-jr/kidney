<?php

namespace App\Models;

use App\Enums\IntakeCategory;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property IntakeCategory $category
 * @property string $amount
 * @property string $unit
 * @property string|null $label
 * @property CarbonImmutable $logged_on
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class IntakeEntry extends Model
{
    protected $fillable = [
        'category',
        'amount',
        'unit',
        'label',
        'logged_on',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => IntakeCategory::class,
            'amount' => 'decimal:1',
            'logged_on' => 'date:Y-m-d',
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
