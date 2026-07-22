import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Droplets,
    Minus,
    NotebookPen,
    Pill,
    Plus,
    Utensils,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Status = 'in_range' | 'low' | 'high' | 'none' | 'empty';

interface Tile {
    metric: string;
    label: string;
    unit: string;
    referenceRange: [number | null, number | null] | null;
    value: number | null;
    previousValue: number | null;
    measuredAt: string | null;
    status: Status;
    spark: { v: number }[];
    count: number;
}

interface Gfr {
    code: string;
    label: string;
    range: string;
    severity: number;
    egfr: number;
    measuredAt: string;
}

interface Risk {
    level: number;
    label: string;
    gfrCode: string;
    albCode: string;
    grid: Record<string, Record<string, number>>;
}

interface Summary {
    activeMedications: number;
    transferSetDue: string | null;
    transferSetDaysUntil: number | null;
    fluidToday: number;
    fluidTarget: number | null;
    symptomsLogged: number;
    latestSymptom: { symptom: string; severity: number; loggedOn: string } | null;
}

interface PageProps {
    tiles: Tile[];
    totalReadings: number;
    gfr: Gfr | null;
    risk: Risk | null;
    summary: Summary;
}

// KDIGO risk-level colors: 1 low -> 4 very high.
const RISK_STYLE: Record<number, { cell: string; text: string; label: string }> = {
    1: { cell: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', label: 'Low' },
    2: { cell: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400', label: 'Moderate' },
    3: { cell: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
    4: { cell: 'bg-rose-600', text: 'text-rose-700 dark:text-rose-400', label: 'Very high' },
};

const GFR_ROWS = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5'];
const ALB_COLS = ['A1', 'A2', 'A3'];
const ALB_HEADERS: Record<string, string> = {
    A1: 'A1 (<30)',
    A2: 'A2 (30–300)',
    A3: 'A3 (>300)',
};

function RiskHeatMap({ risk }: { risk: Risk }) {
    const active = RISK_STYLE[risk.level];

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">KDIGO risk map</span>
                    <Badge className={cn('border-transparent text-white', active.cell)}>
                        {risk.label}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    GFR category {risk.gfrCode} × albuminuria {risk.albCode}. Prognosis
                    grid only — not a diagnosis.
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="inline-grid grid-cols-[auto_repeat(3,minmax(64px,1fr))] gap-1 text-center text-xs">
                        {/* Header row */}
                        <div className="flex items-end justify-center pb-1 text-[10px] font-medium text-muted-foreground">
                            GFR ↓ / Alb →
                        </div>
                        {ALB_COLS.map((a) => (
                            <div
                                key={a}
                                className="flex items-end justify-center pb-1 text-[10px] font-medium text-muted-foreground"
                            >
                                {ALB_HEADERS[a]}
                            </div>
                        ))}

                        {/* Grid rows */}
                        {GFR_ROWS.map((g) => (
                            <div key={g} className="contents">
                                <div className="flex items-center justify-end pr-2 text-[11px] font-medium text-muted-foreground">
                                    {g}
                                </div>
                                {ALB_COLS.map((a) => {
                                    const level = risk.grid[g]?.[a] ?? 1;
                                    const isActive =
                                        g === risk.gfrCode && a === risk.albCode;
                                    return (
                                        <div
                                            key={a}
                                            className={cn(
                                                'flex aspect-square items-center justify-center rounded-md text-white/90 transition',
                                                RISK_STYLE[level].cell,
                                                isActive
                                                    ? 'scale-105 shadow-lg ring-2 ring-foreground ring-offset-2 ring-offset-background'
                                                    : 'opacity-60',
                                            )}
                                        >
                                            {isActive && (
                                                <span className="text-lg font-bold">●</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((l) => (
                        <div key={l} className="flex items-center gap-1.5 text-xs">
                            <span className={cn('size-3 rounded-sm', RISK_STYLE[l].cell)} />
                            <span className="text-muted-foreground">
                                {RISK_STYLE[l].label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// KDIGO GFR-category color ramp: green (best) -> deep red (worst).
const SEVERITY_STYLE: Record<number, { bar: string; text: string; bg: string }> = {
    1: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500/10' },
    2: { bar: 'bg-lime-500', text: 'text-lime-600 dark:text-lime-400', bg: 'from-lime-500/10' },
    3: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'from-amber-500/10' },
    4: { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'from-orange-500/10' },
    5: { bar: 'bg-rose-600', text: 'text-rose-600 dark:text-rose-400', bg: 'from-rose-600/10' },
};

const GFR_CATEGORIES = [
    { code: 'G1', range: '≥90' },
    { code: 'G2', range: '60–89' },
    { code: 'G3a', range: '45–59' },
    { code: 'G3b', range: '30–44' },
    { code: 'G4', range: '15–29' },
    { code: 'G5', range: '<15' },
];

function GfrCard({ gfr }: { gfr: Gfr }) {
    const s = SEVERITY_STYLE[gfr.severity];

    return (
        <Card className={cn('overflow-hidden bg-gradient-to-br to-transparent', s.bg)}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            'flex size-16 flex-col items-center justify-center rounded-xl text-white',
                            s.bar,
                        )}
                    >
                        <span className="text-xl font-bold leading-none">{gfr.code}</span>
                    </div>
                    <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            GFR category (KDIGO)
                        </div>
                        <div className={cn('text-lg font-semibold', s.text)}>{gfr.label}</div>
                        <div className="text-sm text-muted-foreground">
                            eGFR {gfr.egfr} mL/min/1.73m² · {gfr.measuredAt}
                        </div>
                    </div>
                </div>

                {/* Category ladder */}
                <div className="flex gap-1">
                    {GFR_CATEGORIES.map((c) => {
                        const active = c.code === gfr.code;
                        return (
                            <div
                                key={c.code}
                                className={cn(
                                    'flex w-11 flex-col items-center gap-1 rounded-md border px-1 py-1.5 text-center transition',
                                    active
                                        ? cn('border-transparent text-white', s.bar)
                                        : 'border-border text-muted-foreground',
                                )}
                            >
                                <span className="text-xs font-semibold">{c.code}</span>
                                <span className="text-[10px] leading-none opacity-80">
                                    {c.range}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

const STATUS_STYLE: Record<
    Status,
    { ring: string; text: string; badge: string; label: string; stroke: string }
> = {
    in_range: {
        ring: 'border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        label: 'In range',
        stroke: '#10b981',
    },
    low: {
        ring: 'border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        label: 'Below range',
        stroke: '#f59e0b',
    },
    high: {
        ring: 'border-rose-500/30',
        text: 'text-rose-600 dark:text-rose-400',
        badge: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
        label: 'Above range',
        stroke: '#f43f5e',
    },
    none: {
        ring: 'border-border',
        text: 'text-foreground',
        badge: 'border-border bg-muted text-muted-foreground',
        label: 'No range',
        stroke: '#6b7280',
    },
    empty: {
        ring: 'border-dashed border-border',
        text: 'text-muted-foreground',
        badge: 'border-border bg-muted text-muted-foreground',
        label: 'No data',
        stroke: '#6b7280',
    },
};

function rangeLabel(range: Tile['referenceRange'], unit: string): string {
    if (!range) return 'No reference range';
    const [low, high] = range;
    if (low !== null && high !== null) return `Ref ${low}–${high} ${unit}`;
    if (low !== null) return `Ref ≥${low} ${unit}`;
    if (high !== null) return `Ref ≤${high} ${unit}`;
    return 'No reference range';
}

function Delta({ value, previous }: { value: number; previous: number | null }) {
    if (previous === null) return null;
    const diff = Math.round((value - previous) * 100) / 100;

    if (diff === 0) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="size-3" /> no change
            </span>
        );
    }

    const up = diff > 0;
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {up ? (
                <ArrowUpRight className="size-3" />
            ) : (
                <ArrowDownRight className="size-3" />
            )}
            {up ? '+' : ''}
            {diff} vs last
        </span>
    );
}

function MetricTile({ tile }: { tile: Tile }) {
    const s = STATUS_STYLE[tile.status];
    const hasData = tile.value !== null;

    return (
        <Card className={cn('gap-0 overflow-hidden transition-shadow hover:shadow-md', s.ring)}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <span className="text-sm font-medium text-muted-foreground">
                    {tile.label}
                </span>
                <Badge className={s.badge}>{s.label}</Badge>
            </CardHeader>

            <CardContent className="pb-3">
                {hasData ? (
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span
                                    className={cn(
                                        'text-3xl font-semibold tabular-nums tracking-tight',
                                        s.text,
                                    )}
                                >
                                    {tile.value}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {tile.unit}
                                </span>
                            </div>
                            <div className="mt-1">
                                <Delta value={tile.value!} previous={tile.previousValue} />
                            </div>
                        </div>

                        {tile.spark.length > 1 && (
                            <div className="h-12 w-24 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={tile.spark}>
                                        <YAxis hide domain={['dataMin', 'dataMax']} />
                                        <Line
                                            type="monotone"
                                            dataKey="v"
                                            stroke={s.stroke}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-[52px] items-center text-sm text-muted-foreground">
                        No readings yet
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t bg-muted/30 py-2 text-xs text-muted-foreground">
                <span>{rangeLabel(tile.referenceRange, tile.unit)}</span>
                <span>{tile.measuredAt ?? '—'}</span>
            </CardFooter>
        </Card>
    );
}

function SummaryCards({ summary }: { summary: Summary }) {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/medications">
                <Card className="transition hover:shadow-md">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                            <Pill className="size-5" />
                        </span>
                        <div>
                            <div className="text-2xl font-semibold tabular-nums">
                                {summary.activeMedications}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                active medications
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/intake">
                <Card className="transition hover:shadow-md">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                            <Utensils className="size-5" />
                        </span>
                        <div>
                            <div className="text-2xl font-semibold tabular-nums">
                                {summary.fluidToday}
                                <span className="text-xs font-normal text-muted-foreground">
                                    {' '}
                                    mL{summary.fluidTarget ? ` / ${summary.fluidTarget}` : ''}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">fluid today</div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/symptoms">
                <Card className="transition hover:shadow-md">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                            <NotebookPen className="size-5" />
                        </span>
                        <div>
                            {summary.latestSymptom ? (
                                <>
                                    <div className="text-sm font-semibold">
                                        {summary.latestSymptom.symptom}{' '}
                                        <span className="text-muted-foreground">
                                            · {summary.latestSymptom.severity}/5
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        latest of {summary.symptomsLogged} symptom
                                        {summary.symptomsLogged === 1 ? '' : 's'}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-semibold tabular-nums">
                                        {summary.symptomsLogged}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        symptoms logged
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}

export default function Dashboard({
    tiles,
    totalReadings,
    gfr,
    risk,
    summary,
}: PageProps) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Hero */}
                <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Activity className="size-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                Kidney health overview
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {totalReadings > 0
                                    ? `${totalReadings} reading${totalReadings === 1 ? '' : 's'} tracked. Latest value per metric below.`
                                    : 'No readings yet — add your first to see trends here.'}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/lab-results">
                            <Plus className="size-4" /> Add reading
                        </Link>
                    </Button>
                </div>

                {/* Transfer-set reminder */}
                {summary.transferSetDaysUntil !== null &&
                    summary.transferSetDaysUntil <= 30 && (
                        <Link
                            href="/dialysis"
                            className={cn(
                                'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition hover:opacity-90',
                                summary.transferSetDaysUntil < 0
                                    ? 'border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                                    : 'border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
                            )}
                        >
                            <Droplets className="size-4 shrink-0" />
                            {summary.transferSetDaysUntil < 0
                                ? `Transfer set change overdue by ${Math.abs(summary.transferSetDaysUntil)} day(s)`
                                : `Transfer set change due in ${summary.transferSetDaysUntil} day(s)`}{' '}
                            · due {summary.transferSetDue}
                        </Link>
                    )}

                {/* Meds / fluid / symptoms summary */}
                <SummaryCards summary={summary} />

                {totalReadings === 0 ? (
                    /* Onboarding */
                    <Card>
                        <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Activity className="size-7" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Let's log your first reading
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a value or two and your trends, GFR category and
                                    risk map appear here automatically.
                                </p>
                            </div>
                            <ol className="grid gap-3 text-left text-sm sm:grid-cols-3">
                                <li className="rounded-lg border border-border p-3">
                                    <span className="font-semibold text-primary">1.</span>{' '}
                                    Open <span className="font-medium">Lab Results</span>.
                                </li>
                                <li className="rounded-lg border border-border p-3">
                                    <span className="font-semibold text-primary">2.</span>{' '}
                                    Pick a metric, enter the value and date.
                                </li>
                                <li className="rounded-lg border border-border p-3">
                                    <span className="font-semibold text-primary">3.</span>{' '}
                                    Come back here to see the picture.
                                </li>
                            </ol>
                            <Button asChild>
                                <Link href="/lab-results">
                                    <Plus className="size-4" /> Add your first reading
                                </Link>
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Not sure? Import a CSV or use the eGFR calculator on the
                                Lab Results page.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* GFR category + KDIGO risk map */}
                        {(gfr || risk) && (
                            <div
                                className={cn(
                                    'grid items-start gap-4',
                                    risk && 'lg:grid-cols-[1fr_auto]',
                                )}
                            >
                                {gfr && <GfrCard gfr={gfr} />}
                                {risk && <RiskHeatMap risk={risk} />}
                            </div>
                        )}

                        {/* Tiles */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {tiles.map((tile) => (
                                <MetricTile key={tile.metric} tile={tile} />
                            ))}
                        </div>
                    </>
                )}

                {/* Disclaimer */}
                <p className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <ArrowRight className="size-3.5 shrink-0" />
                    Personal tracking only — not medical advice or a diagnosis.
                    Reference ranges are general adult values; confirm every result
                    with the lab report and care team.
                </p>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
