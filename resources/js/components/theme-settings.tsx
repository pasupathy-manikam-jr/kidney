import { COLOR_THEMES, TEXT_SIZES, useThemePrefs } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export function ThemeSettings() {
    const { theme, text, setTheme, setText } = useThemePrefs();

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium">Colour theme</h3>
                    <p className="text-xs text-muted-foreground">
                        Works with light and dark mode.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {COLOR_THEMES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setTheme(t.value)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                                theme === t.value
                                    ? 'border-primary ring-2 ring-primary/40'
                                    : 'border-border hover:bg-muted',
                            )}
                        >
                            <span
                                className="size-4 rounded-full border border-black/10"
                                style={{ backgroundColor: t.swatch }}
                            />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium">Text size</h3>
                    <p className="text-xs text-muted-foreground">
                        Larger text can be easier to read.
                    </p>
                </div>
                <div className="inline-flex rounded-lg border border-border p-0.5">
                    {TEXT_SIZES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setText(t.value)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                text === t.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
