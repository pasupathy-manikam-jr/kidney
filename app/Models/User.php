<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'sex', 'date_of_birth', 'dry_weight', 'intake_targets', 'emergency_contacts'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'intake_targets' => 'array',
            'emergency_contacts' => 'array',
            'date_of_birth' => 'date:Y-m-d',
            'dry_weight' => 'decimal:1',
        ];
    }

    /** Age in years from date_of_birth, or null. */
    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth
            ? (int) $this->date_of_birth->diffInYears(now())
            : null;
    }

    /**
     * Effective daily target for an intake category: the user's own value if
     * set, otherwise the general suggested limit from the enum.
     */
    public function intakeTarget(\App\Enums\IntakeCategory $category): ?int
    {
        $custom = $this->intake_targets[$category->value] ?? null;

        return $custom !== null ? (int) $custom : $category->suggestedLimit();
    }

    /**
     * @return HasMany<LabResult, $this>
     */
    public function labResults(): HasMany
    {
        return $this->hasMany(LabResult::class);
    }

    /**
     * @return HasMany<Medication, $this>
     */
    public function medications(): HasMany
    {
        return $this->hasMany(Medication::class);
    }

    /**
     * @return HasMany<IntakeEntry, $this>
     */
    public function intakeEntries(): HasMany
    {
        return $this->hasMany(IntakeEntry::class);
    }

    /**
     * @return HasMany<SymptomEntry, $this>
     */
    public function symptomEntries(): HasMany
    {
        return $this->hasMany(SymptomEntry::class);
    }

    /**
     * @return HasMany<Catheter, $this>
     */
    public function catheters(): HasMany
    {
        return $this->hasMany(Catheter::class);
    }

    /**
     * @return HasMany<CatheterLog, $this>
     */
    public function catheterLogs(): HasMany
    {
        return $this->hasMany(CatheterLog::class);
    }
}
