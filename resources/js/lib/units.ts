import { usePage } from '@inertiajs/react';

export type Units = 'conventional' | 'si';

export interface SiInfo {
    unit: string;
    factor: number;
    precision: number;
}

/** The current user's preferred units, defaulting to conventional. */
export function useUnits(): Units {
    const page = usePage<{ auth?: { user?: { units?: string | null } } }>();
    return page.props.auth?.user?.units === 'si' ? 'si' : 'conventional';
}

function round(n: number, precision: number): number {
    const f = 10 ** precision;
    return Math.round(n * f) / f;
}

/**
 * Convert a stored (conventional) value + unit to the display units.
 */
export function display(
    value: number,
    conventionalUnit: string,
    si: SiInfo | undefined,
    units: Units,
): { value: number; unit: string } {
    if (units === 'si' && si) {
        return { value: round(value * si.factor, si.precision), unit: si.unit };
    }
    return { value, unit: conventionalUnit };
}

/** Convert a reference-range bound (or null) to display units. */
export function displayBound(
    bound: number | null,
    si: SiInfo | undefined,
    units: Units,
): number | null {
    if (bound === null) return null;
    if (units === 'si' && si) return round(bound * si.factor, si.precision);
    return bound;
}
