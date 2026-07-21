import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface Metric {
    value: string;
    label: string;
    unit: string;
    referenceRange: [number | null, number | null] | null;
    precision: number;
}

interface Category {
    code: string;
    label: string;
    range: string;
    severity?: number;
}

interface PageProps {
    metrics: Metric[];
    gfrCategories: Category[];
    albuminuriaCategories: Category[];
    riskGrid: Record<string, Record<string, number>>;
}

function refRange(r: Metric['referenceRange'], unit: string): string {
    if (!r) return '—';
    const [low, high] = r;
    if (low !== null && high !== null) return `${low}–${high} ${unit}`;
    if (low !== null) return `≥${low} ${unit}`;
    if (high !== null) return `<${high} ${unit}`;
    return '—';
}

const GFR_SEVERITY: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-lime-500',
    3: 'bg-amber-500',
    4: 'bg-orange-500',
    5: 'bg-rose-600',
};

const RISK_CELL: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-amber-400',
    3: 'bg-orange-500',
    4: 'bg-rose-600',
};

const RISK_LABEL: Record<number, string> = {
    1: 'Low',
    2: 'Moderate',
    3: 'High',
    4: 'Very high',
};

const ALB_COLS = ['A1', 'A2', 'A3'];

export default function Reference({
    metrics,
    gfrCategories,
    albuminuriaCategories,
    riskGrid,
}: PageProps) {
    return (
        <>
            <Head title="Reference" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    General adult reference values (KDIGO / common lab ranges). Not a
                    diagnosis — ranges vary by lab, age and sex. Always confirm against
                    the lab report and care team.
                </p>

                {/* Metric reference ranges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tracked metrics &amp; reference ranges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Metric</th>
                                        <th className="py-2 pr-4 font-medium">Unit</th>
                                        <th className="py-2 font-medium">Reference range</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((m) => (
                                        <tr key={m.value} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-medium">{m.label}</td>
                                            <td className="py-2 pr-4 text-muted-foreground">
                                                {m.unit}
                                            </td>
                                            <td className="py-2">
                                                {refRange(m.referenceRange, m.unit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* GFR categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>KDIGO GFR categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Cat.</th>
                                        <th className="py-2 pr-4 font-medium">eGFR</th>
                                        <th className="py-2 font-medium">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gfrCategories.map((c) => (
                                        <tr key={c.code} className="border-b last:border-0">
                                            <td className="py-2 pr-4">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold text-white',
                                                        GFR_SEVERITY[c.severity ?? 1],
                                                    )}
                                                >
                                                    {c.code}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-4 tabular-nums">{c.range}</td>
                                            <td className="py-2 text-muted-foreground">
                                                {c.label}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Albuminuria categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>KDIGO albuminuria categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Cat.</th>
                                        <th className="py-2 pr-4 font-medium">UACR (mg/g)</th>
                                        <th className="py-2 font-medium">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albuminuriaCategories.map((c) => (
                                        <tr key={c.code} className="border-b last:border-0">
                                            <td className="py-2 pr-4 font-semibold">{c.code}</td>
                                            <td className="py-2 pr-4 tabular-nums">{c.range}</td>
                                            <td className="py-2 text-muted-foreground">
                                                {c.label}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* KDIGO risk grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>KDIGO risk map (GFR × albuminuria)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="text-center text-sm">
                                <thead>
                                    <tr className="text-muted-foreground">
                                        <th className="p-2 text-left font-medium">GFR ↓ / Alb →</th>
                                        {ALB_COLS.map((a) => (
                                            <th key={a} className="p-2 font-medium">
                                                {a}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(riskGrid).map(([g, cols]) => (
                                        <tr key={g}>
                                            <td className="p-2 text-left font-medium text-muted-foreground">
                                                {g}
                                            </td>
                                            {ALB_COLS.map((a) => {
                                                const level = cols[a] ?? 1;
                                                return (
                                                    <td key={a} className="p-1">
                                                        <span
                                                            className={cn(
                                                                'flex h-9 w-16 items-center justify-center rounded text-xs font-medium text-white/90',
                                                                RISK_CELL[level],
                                                            )}
                                                        >
                                                            {RISK_LABEL[level]}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {[1, 2, 3, 4].map((l) => (
                                <div key={l} className="flex items-center gap-1.5 text-xs">
                                    <span className={cn('size-3 rounded-sm', RISK_CELL[l])} />
                                    <span className="text-muted-foreground">
                                        {RISK_LABEL[l]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Reference.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Reference', href: '/reference' },
    ],
};
