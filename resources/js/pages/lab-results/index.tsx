import { Head, useForm } from '@inertiajs/react';
import { Download, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import LabResultController from '@/actions/App/Http/Controllers/LabResultController';
import { ConfirmDelete } from '@/components/confirm-delete';
import { EgfrCalculator } from '@/components/egfr-calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface MetricInfo {
    value: string;
    label: string;
    unit: string;
    referenceRange: [number | null, number | null] | null;
    precision: number;
}

interface LabResultRow {
    id: number;
    metric: string;
    value: string;
    unit: string;
    measured_at: string;
    note: string | null;
}

interface PageProps {
    results: LabResultRow[];
    catalog: MetricInfo[];
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

interface TooltipProps {
    active?: boolean;
    label?: string | number;
    payload?: { value: number; payload?: { note?: string | null } }[];
    unit: string;
    metricLabel: string;
}

function ChartTooltip({ active, label, payload, unit, metricLabel }: TooltipProps) {
    if (!active || !payload?.length) return null;
    const note = payload[0].payload?.note;
    return (
        <div className="max-w-56 rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
            <div className="mb-0.5 text-muted-foreground">{label}</div>
            <div className="font-medium">
                {metricLabel}: {payload[0].value} {unit}
            </div>
            {note && (
                <div className="mt-1 border-t border-border pt-1 text-muted-foreground">
                    📝 {note}
                </div>
            )}
        </div>
    );
}

function EditReadingDialog({
    reading,
    catalog,
    catalogMap,
    onClose,
}: {
    reading: LabResultRow | null;
    catalog: MetricInfo[];
    catalogMap: Record<string, MetricInfo>;
    onClose: () => void;
}) {
    const form = useForm({
        metric: reading?.metric ?? '',
        value: reading?.value ?? '',
        measured_at: reading?.measured_at ?? today(),
        note: reading?.note ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reading) return;
        form.put(LabResultController.update(reading.id).url, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open={!!reading} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit reading</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-metric">Metric</Label>
                        <Select
                            value={form.data.metric}
                            onValueChange={(v) => form.setData('metric', v)}
                        >
                            <SelectTrigger id="edit-metric" className="w-full">
                                <SelectValue placeholder="Select a metric" />
                            </SelectTrigger>
                            <SelectContent>
                                {catalog.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label} ({m.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.metric} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-value">
                            Value{' '}
                            {catalogMap[form.data.metric] && (
                                <span className="text-muted-foreground">
                                    ({catalogMap[form.data.metric].unit})
                                </span>
                            )}
                        </Label>
                        <Input
                            id="edit-value"
                            type="number"
                            step="0.1"
                            min="0"
                            value={form.data.value}
                            onChange={(e) => form.setData('value', e.target.value)}
                            required
                        />
                        <InputError message={form.errors.value} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input
                            id="edit-date"
                            type="date"
                            max={today()}
                            value={form.data.measured_at}
                            onChange={(e) => form.setData('measured_at', e.target.value)}
                            required
                        />
                        <InputError message={form.errors.measured_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-note">Note (optional)</Label>
                        <Input
                            id="edit-note"
                            type="text"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                        />
                        <InputError message={form.errors.note} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function LabResultsIndex({ results, catalog }: PageProps) {
    const [editing, setEditing] = useState<LabResultRow | null>(null);
    const catalogMap = useMemo(
        () => Object.fromEntries(catalog.map((m) => [m.value, m])),
        [catalog],
    );

    const [selectedMetric, setSelectedMetric] = useState(catalog[0]?.value ?? '');
    const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('all');
    const [filterMetric, setFilterMetric] = useState('all');
    const [search, setSearch] = useState('');

    const form = useForm({
        metric: catalog[0]?.value ?? '',
        value: '',
        measured_at: today(),
        note: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(LabResultController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset('value', 'note'),
        });
    };

    const remove = (id: number) => {
        form.delete(LabResultController.destroy(id).url, { preserveScroll: true });
    };

    const importForm = useForm<{ file: File | null }>({ file: null });

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        importForm.setData('file', file);
        importForm.post(LabResultController.import().url, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                e.target.value = '';
                importForm.reset();
            },
        });
    };

    // Chart data for the selected metric, oldest -> newest, within the range.
    const chartData = useMemo(() => {
        const cutoff = new Date();
        if (timeRange === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
        else if (timeRange === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
        else if (timeRange === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);
        const cutoffStr =
            timeRange === 'all' ? '0000-00-00' : cutoff.toISOString().slice(0, 10);

        return results
            .filter(
                (r) => r.metric === selectedMetric && r.measured_at >= cutoffStr,
            )
            .map((r) => ({
                date: r.measured_at,
                value: Number(r.value),
                note: r.note,
            }))
            .reverse();
    }, [results, selectedMetric, timeRange]);

    const filteredResults = useMemo(() => {
        const q = search.trim().toLowerCase();
        return results.filter((r) => {
            if (filterMetric !== 'all' && r.metric !== filterMetric) return false;
            if (!q) return true;
            const label = catalogMap[r.metric]?.label.toLowerCase() ?? r.metric;
            const haystack = [
                label,
                r.note ?? '',
                r.measured_at,
                r.value,
                r.unit,
                `${r.value} ${r.unit}`,
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [results, filterMetric, search, catalogMap]);

    const selectedInfo = catalogMap[selectedMetric];
    const range = selectedInfo?.referenceRange ?? null;

    return (
        <>
            <Head title="Lab Results" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    This tool is for personal tracking only. It is not medical
                    advice and does not diagnose anything. Reference ranges shown
                    are general adult values — always confirm with the lab report
                    and your care team.
                </p>

                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    {/* Entry form */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                            <CardTitle>Add a reading</CardTitle>
                            <EgfrCalculator
                                onUse={(egfr) => {
                                    form.setData('metric', 'egfr');
                                    form.setData('value', String(egfr));
                                }}
                            />
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="metric">Metric</Label>
                                    <Select
                                        value={form.data.metric}
                                        onValueChange={(v) => form.setData('metric', v)}
                                    >
                                        <SelectTrigger id="metric" className="w-full">
                                            <SelectValue placeholder="Select a metric" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {catalog.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label} ({m.unit})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.metric} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="value">
                                        Value{' '}
                                        {catalogMap[form.data.metric] && (
                                            <span className="text-muted-foreground">
                                                ({catalogMap[form.data.metric].unit})
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.data.value}
                                        onChange={(e) =>
                                            form.setData('value', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.value} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="measured_at">Date</Label>
                                    <Input
                                        id="measured_at"
                                        type="date"
                                        max={today()}
                                        value={form.data.measured_at}
                                        onChange={(e) =>
                                            form.setData('measured_at', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.measured_at} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="note">Note (optional)</Label>
                                    <Input
                                        id="note"
                                        type="text"
                                        value={form.data.note}
                                        onChange={(e) =>
                                            form.setData('note', e.target.value)
                                        }
                                    />
                                    <InputError message={form.errors.note} />
                                </div>

                                <Button type="submit" disabled={form.processing}>
                                    Save reading
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Trend chart */}
                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>Trend</CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex rounded-md border border-border p-0.5">
                                    {(['3m', '6m', '1y', 'all'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setTimeRange(r)}
                                            className={cn(
                                                'rounded px-2.5 py-1 text-xs font-medium transition',
                                                timeRange === r
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {r === 'all' ? 'All' : r.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <Select
                                    value={selectedMetric}
                                    onValueChange={setSelectedMetric}
                                >
                                    <SelectTrigger className="w-44">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {catalog.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {chartData.length === 0 ? (
                                <p className="py-16 text-center text-sm text-muted-foreground">
                                    No readings yet for{' '}
                                    {selectedInfo?.label ?? 'this metric'}.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-border"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            fontSize={12}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            width={40}
                                            domain={['auto', 'auto']}
                                            unit=""
                                        />
                                        {range &&
                                            range[0] !== null &&
                                            range[1] !== null && (
                                                <ReferenceArea
                                                    y1={range[0]}
                                                    y2={range[1]}
                                                    fill="currentColor"
                                                    fillOpacity={0.08}
                                                    className="text-emerald-500"
                                                />
                                            )}
                                        <Tooltip
                                            cursor={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
                                            content={
                                                <ChartTooltip
                                                    unit={selectedInfo?.unit ?? ''}
                                                    metricLabel={selectedInfo?.label ?? ''}
                                                />
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="currentColor"
                                            className="text-primary"
                                            strokeWidth={2}
                                            dot={(props) => {
                                                const { cx, cy, payload, index } = props;
                                                const hasNote = !!payload?.note;
                                                return (
                                                    <circle
                                                        key={index}
                                                        cx={cx}
                                                        cy={cy}
                                                        r={hasNote ? 5 : 3}
                                                        className="text-primary"
                                                        fill={
                                                            hasNote
                                                                ? 'currentColor'
                                                                : 'var(--background)'
                                                        }
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    />
                                                );
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {chartData.length > 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {range && (
                                        <>
                                            Shaded band = general reference range
                                            {range[0] !== null && range[1] !== null
                                                ? ` (${range[0]}–${range[1]} ${selectedInfo?.unit})`
                                                : range[0] !== null
                                                  ? ` (≥${range[0]} ${selectedInfo?.unit})`
                                                  : ''}
                                            . Confirm with your care team.{' '}
                                        </>
                                    )}
                                    Filled dots have a note — hover to read it.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* History table */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>History</CardTitle>
                        <div className="flex items-center gap-2">
                            <a href={LabResultController.export().url}>
                                <Button type="button" variant="outline" size="sm">
                                    <Download className="size-4" /> Export CSV
                                </Button>
                            </a>
                            <label>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    className="hidden"
                                    onChange={handleImport}
                                    disabled={importForm.processing}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={importForm.processing}
                                >
                                    <span className="cursor-pointer">
                                        <Upload className="size-4" /> Import CSV
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {results.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No readings yet. Add your first above.
                            </p>
                        ) : (
                            <>
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                                    <Input
                                        type="search"
                                        placeholder="Search notes, metric or date…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="sm:max-w-xs"
                                    />
                                    <Select
                                        value={filterMetric}
                                        onValueChange={setFilterMetric}
                                    >
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All metrics</SelectItem>
                                            {catalog.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {filteredResults.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No readings match your filter.
                                    </p>
                                ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="py-2 pr-4 font-medium">Date</th>
                                            <th className="py-2 pr-4 font-medium">Metric</th>
                                            <th className="py-2 pr-4 font-medium">Value</th>
                                            <th className="py-2 pr-4 font-medium">Note</th>
                                            <th className="py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredResults.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="py-2 pr-4">{r.measured_at}</td>
                                                <td className="py-2 pr-4">
                                                    {catalogMap[r.metric]?.label ?? r.metric}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {r.value} {r.unit}
                                                </td>
                                                <td className="py-2 pr-4 text-muted-foreground">
                                                    {r.note ?? ''}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setEditing(r)}
                                                            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <ConfirmDelete
                                                            onConfirm={() => remove(r.id)}
                                                            title="Delete this reading?"
                                                            trigger={
                                                                <button className="text-xs text-destructive hover:underline">
                                                                    Delete
                                                                </button>
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditReadingDialog
                key={editing?.id ?? 'none'}
                reading={editing}
                catalog={catalog}
                catalogMap={catalogMap}
                onClose={() => setEditing(null)}
            />
        </>
    );
}

LabResultsIndex.layout = {
    breadcrumbs: [{ title: 'Lab Results', href: '/lab-results' }],
};
