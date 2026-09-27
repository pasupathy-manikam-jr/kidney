<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\IntakeCategory;
use Carbon\CarbonImmutable;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $sex
 * @property CarbonImmutable|null $date_of_birth
 * @property string|null $dry_weight
 * @property string $units
 * @property string $timezone
 * @property string $theme
 * @property string $text_size
 * @property array<string, int|string>|null $intake_targets Keyed by IntakeCategory value.
 * @property list<array{name?: string|null, role?: string|null, phone?: string|null}>|null $emergency_contacts
 * @property CarbonImmutable|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property CarbonImmutable|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'sex', 'date_of_birth', 'dry_weight', 'units', 'timezone', 'theme', 'text_size', 'intake_targets', 'emergency_contacts'])]
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
    public function intakeTarget(IntakeCategory $category): int
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
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * @return HasMany<PushSubscription, $this>
     */
    public function pushSubscriptions(): HasMany
    {
        return $this->hasMany(PushSubscription::class);
    }

    /**
     * @return HasMany<CatheterLog, $this>
     */
    public function catheterLogs(): HasMany
    {
        return $this->hasMany(CatheterLog::class);
    }

    /**
     * People this user (as patient) invited to view their data.
     *
     * @return HasMany<CareShare, $this>
     */
    public function caregiverShares(): HasMany
    {
        return $this->hasMany(CareShare::class, 'patient_id');
    }

    /**
     * Accepted shares where this user is the caregiver (patients they can view).
     *
     * @return HasMany<CareShare, $this>
     */
    public function patientShares(): HasMany
    {
        return $this->hasMany(CareShare::class, 'caregiver_id')->whereNotNull('accepted_at');
    }
}
