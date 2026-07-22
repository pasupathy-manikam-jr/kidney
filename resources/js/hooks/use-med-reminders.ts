import { useEffect, useRef } from 'react';

export interface ReminderMed {
    id: number;
    name: string;
    dosage: string | null;
    reminder_time: string | null; // "HH:MM"
    active: boolean;
}

const STORAGE_KEY = 'med-reminders-enabled';

export function remindersEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
}

export function setRemindersEnabled(on: boolean): void {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
}

/**
 * While the app is open and reminders are enabled, fire a browser notification
 * when the clock reaches each active medication's reminder time (once per day).
 * Background reminders (app closed) would require a service worker + push.
 */
export function useMedReminders(meds: ReminderMed[]): void {
    const firedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        const tick = () => {
            if (!remindersEnabled() || Notification.permission !== 'granted') return;

            const now = new Date();
            const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(
                now.getMinutes(),
            ).padStart(2, '0')}`;
            const dayKey = now.toISOString().slice(0, 10);

            for (const m of meds) {
                if (!m.active || !m.reminder_time) continue;
                if (m.reminder_time !== hhmm) continue;

                const key = `${dayKey}:${m.id}`;
                if (firedRef.current.has(key)) continue;
                firedRef.current.add(key);

                new Notification('Medication reminder', {
                    body: m.dosage ? `${m.name} · ${m.dosage}` : m.name,
                    tag: key,
                });
            }
        };

        tick();
        const interval = window.setInterval(tick, 30_000);
        return () => window.clearInterval(interval);
    }, [meds]);
}
