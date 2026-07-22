import { useSyncExternalStore } from 'react';

export type ColorTheme =
    | 'default'
    | 'teal'
    | 'ocean'
    | 'forest'
    | 'sunset'
    | 'contrast';
export type TextSize = 'normal' | 'large' | 'xl';

export const COLOR_THEMES: { value: ColorTheme; label: string; swatch: string }[] = [
    { value: 'default', label: 'Neutral', swatch: '#404040' },
    { value: 'teal', label: 'Teal', swatch: '#0d9488' },
    { value: 'ocean', label: 'Ocean', swatch: '#2563eb' },
    { value: 'forest', label: 'Forest', swatch: '#16a34a' },
    { value: 'sunset', label: 'Sunset', swatch: '#ea580c' },
    { value: 'contrast', label: 'High contrast', swatch: '#000000' },
];

export const TEXT_SIZES: { value: TextSize; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'xl', label: 'Extra large' },
];

const DEFAULT_THEME: ColorTheme = 'ocean';
const DEFAULT_TEXT: TextSize = 'large';

const listeners = new Set<() => void>();
let currentTheme: ColorTheme = DEFAULT_THEME;
let currentText: TextSize = DEFAULT_TEXT;

function setCookie(name: string, value: string, days = 365): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${value};path=/;max-age=${days * 86400};SameSite=Lax`;
}

function apply(): void {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    if (currentTheme === 'default') {
        delete el.dataset.theme;
    } else {
        el.dataset.theme = currentTheme;
    }
    if (currentText === 'normal') {
        delete el.dataset.text;
    } else {
        el.dataset.text = currentText;
    }
}

const notify = () => listeners.forEach((l) => l());

export function initializeThemePrefs(): void {
    if (typeof window === 'undefined') return;
    currentTheme = (localStorage.getItem('theme') as ColorTheme) || DEFAULT_THEME;
    currentText = (localStorage.getItem('text') as TextSize) || DEFAULT_TEXT;
    apply();
}

export function useThemePrefs() {
    const theme = useSyncExternalStore(
        (cb) => {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        () => currentTheme,
        () => 'default' as ColorTheme,
    );
    const text = useSyncExternalStore(
        (cb) => {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        () => currentText,
        () => 'normal' as TextSize,
    );

    const setTheme = (t: ColorTheme) => {
        currentTheme = t;
        localStorage.setItem('theme', t);
        setCookie('theme', t);
        apply();
        notify();
    };
    const setText = (t: TextSize) => {
        currentText = t;
        localStorage.setItem('text', t);
        setCookie('text', t);
        apply();
        notify();
    };

    return { theme, text, setTheme, setText } as const;
}
