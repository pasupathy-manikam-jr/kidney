import { router, usePage } from '@inertiajs/react';
import { Eye } from 'lucide-react';

/**
 * Shown across the top when a caregiver is viewing a patient's data read-only.
 */
export function ViewingBanner() {
    const { viewing } = usePage<{ viewing?: { name: string } | null }>().props;

    if (!viewing) return null;

    return (
        <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
            <span className="flex items-center gap-2">
                <Eye className="size-4" />
                Viewing {viewing.name}'s data (read-only)
            </span>
            <button
                onClick={() => router.post('/shared/exit')}
                className="rounded-md bg-amber-950/10 px-3 py-1 text-xs font-semibold transition hover:bg-amber-950/20"
            >
                Exit
            </button>
        </div>
    );
}
