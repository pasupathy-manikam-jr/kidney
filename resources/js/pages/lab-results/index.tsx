import { Head, useForm } from '@inertiajs/react';
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
    payload?: { value: number }[];
    unit: string;
    metricLabel: string;
}

function ChartTooltip({ active, label, payload, unit, metricLabel }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
            <div className="mb-0.5 text-muted-foreground">{label}</div>
            <div className="font-medium">
                {metricLabel}: {payload[0].value} {unit}
            </div>
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
        if (!confirm('Delete this reading?')) return;
        form.delete(LabResultController.destroy(id).url, { preserveScroll: true });
    };

    // Chart data for the selected metric, oldest -> newest.
    const chartData = useMemo(() => {
        return results
            .filter((r) => r.metric === selectedMetric)
            .map((r) => ({
                date: r.measured_at,
                value: Number(r.value),
            }))
            .reverse();
    }, [results, selectedMetric]);

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
                        <CardHeader>
                            <CardTitle>Add a reading</CardTitle>
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
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle>Trend</CardTitle>
                            <Select
                                value={selectedMetric}
                                onValueChange={setSelectedMetric}
                            >
                                <SelectTrigger className="w-48">
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
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {range && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Shaded band = general reference range
                                    {range[0] !== null && range[1] !== null
                                        ? ` (${range[0]}–${range[1]} ${selectedInfo?.unit})`
                                        : range[0] !== null
                                          ? ` (≥${range[0]} ${selectedInfo?.unit})`
                                          : ''}
                                    . Confirm with your care team.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* History table */}
                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {results.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No readings yet. Add your first above.
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
                                        {results.map((r) => (
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
                                                        <button
                                                            onClick={() => remove(r.id)}
                                                            className="text-xs text-destructive hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
