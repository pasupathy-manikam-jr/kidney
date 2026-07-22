<?php

namespace App\Enums;

/**
 * Appearance of drained peritoneal dialysis fluid (effluent). Clear/pale straw
 * is normal; cloudy suggests peritonitis (infection) and pink/bloody suggests
 * bleeding — both warrant contacting the care team. NOT a diagnosis.
 */
enum EffluentColor: string
{
    case Clear = 'clear';
    case PaleYellow = 'pale_yellow';
    case Cloudy = 'cloudy';
    case Pink = 'pink';
    case Bloody = 'bloody';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Clear => 'Clear',
            self::PaleYellow => 'Pale yellow / straw',
            self::Cloudy => 'Cloudy',
            self::Pink => 'Pink-tinged',
            self::Bloody => 'Bloody / red',
            self::Other => 'Other',
        };
    }

    /** True when the appearance should prompt contacting the care team. */
    public function isWarning(): bool
    {
        return match ($this) {
            self::Cloudy, self::Pink, self::Bloody => true,
            default => false,
        };
    }

    public function guidance(): ?string
    {
        return match ($this) {
            self::Cloudy => 'Cloudy fluid can be a sign of infection (peritonitis). Contact your care team promptly.',
            self::Pink, self::Bloody => 'Pink or bloody fluid can signal bleeding. Contact your care team.',
            default => null,
        };
    }

    public static function catalog(): array
    {
        return array_map(fn (self $c) => [
            'value' => $c->value,
            'label' => $c->label(),
            'warning' => $c->isWarning(),
        ], self::cases());
    }
}
