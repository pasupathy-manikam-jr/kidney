import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, Droplets, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import CatheterController from '@/actions/App/Http/Controllers/CatheterController';
import CatheterLogController from '@/actions/App/Http/Controllers/CatheterLogController';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { dashboard } from '@/routes';

interface Catheter {
    brand: string | null;
    catheter_type: string | null;
    inserted_on: string | null;
    transfer_set_changed_on: string | null;
    transfer_set_interval_months: number;
    notes: string | null;
}

interface Color {
    value: string;
    label: string;
    warning: boolean;
}

interface LogEntry {
    id: number;
    logged_on: string;
    fill_volume: number | null;
    drain_volume: number | null;
    ultrafiltration: number | null;
    effluent_color: string | null;
    notes: string | null;
}

interface PageProps {
    catheter: Catheter | null;
    nextTransferSetChange: string | null;
    daysUntilChange: number | null;
    logs: LogEntry[];
    colors: Color[];
    today: string;
}

function CatheterDialog({ catheter }: { catheter: Catheter | null }) {
    const form = useForm({
        brand: catheter?.brand ?? '',
        catheter_type: catheter?.catheter_type ?? '',
        inserted_on: catheter?.inserted_on ?? '',
        transfer_set_changed_on: catheter?.transfer_set_changed_on ?? '',
        transfer_set_interval_months: catheter?.transfer_set_interval_months ?? 6,
        notes: catheter?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(CatheterController.update().url, { preserveScroll: true });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <Pencil className="size-4" /> {catheter ? 'Edit' : 'Add details'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Catheter details</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={form.data.brand}
                                onChange={(e) => form.setData('brand', e.target.value)}
                                placeholder="e.g. Covidien"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="catheter_type">Type</Label>
                            <Input
                                id="catheter_type"
                                value={form.data.catheter_type}
                                onChange={(e) =>
                                    form.setData('catheter_type', e.target.value)
                                }
                                placeholder="Tenckhoff coiled"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="inserted_on">Inserted on</Label>
                            <Input
                                id="inserted_on"
                                type="date"
                                max={new Date().toISOString().slice(0, 10)}
                                value={form.data.inserted_on}
                                onChange={(e) =>
                                    form.setData('inserted_on', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transfer_set_changed_on">
                                Transfer set last changed
                            </Label>
                            <Input
                                id="transfer_set_changed_on"
                                type="date"
                                max={new Date().toISOString().slice(0, 10)}
                                value={form.data.transfer_set_changed_on}
                                onChange={(e) =>
                                    form.setData('transfer_set_changed_on', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interval">
                            Change transfer set every (months)
                        </Label>
                        <Input
                            id="interval"
                            type="number"
                            min="1"
                            max="24"
                            value={form.data.transfer_set_interval_months}
                            onChange={(e) =>
                                form.setData(
                                    'transfer_set_interval_months',
                                    Number(e.target.value),
                                )
                            }
                            required
                        />
                        <InputError
                            message={form.errors.transfer_set_interval_months}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cath-notes">Notes</Label>
                        <Input
                            id="cath-notes"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            Save details
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function DialysisIndex({
    catheter,
    nextTransferSetChange,
    daysUntilChange,
    logs,
    colors,
    today,
}: PageProps) {
    const colorMap = useMemo(
        () => Object.fromEntries(colors.map((c) => [c.value, c])),
        [colors],
    );

    const form = useForm({
        logged_on: today,
        fill_volume: '',
        drain_volume: '',
        effluent_color: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(CatheterLogController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset('fill_volume', 'drain_volume', 'notes'),
        });
    };

    const remove = (id: number) => {
        form.delete(CatheterLogController.destroy(id).url, { preserveScroll: true });
    };

    const liveUf =
        form.data.fill_volume !== '' && form.data.drain_volume !== ''
            ? Number(form.data.drain_volume) - Number(form.data.fill_volume)
            : null;

    // Warn if the most recent effluent looks abnormal.
    const latestWarning = logs.find(
        (l) => l.effluent_color && colorMap[l.effluent_color]?.warning,
    );

    // Ultrafiltration over time (oldest -> newest, last 14 with a UF value).
    const ufData = useMemo(
        () =>
            [...logs]
                .filter((l) => l.ultrafiltration !== null)
                .reverse()
                .slice(-14)
                .map((l) => ({ date: l.logged_on, uf: l.ultrafiltration as number })),
        [logs],
    );

    // Transfer-set reminder status.
    const changeStatus =
        daysUntilChange === null
            ? null
            : daysUntilChange < 0
              ? { tone: 'over', text: `Transfer set change overdue by ${Math.abs(daysUntilChange)} day(s)` }
              : daysUntilChange <= 30
                ? { tone: 'soon', text: `Transfer set change due in ${daysUntilChange} day(s)` }
                : { tone: 'ok', text: `Next transfer set change in ${daysUntilChange} day(s)` };

    return (
        <>
            <Head title="Dialysis" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Reminder banner */}
                {changeStatus && (
                    <div
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
                            changeStatus.tone === 'over' &&
                                'border-rose-500/40 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
                            changeStatus.tone === 'soon' &&
                                'border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
                            changeStatus.tone === 'ok' &&
                                'border-border bg-muted/40 text-muted-foreground',
                        )}
                    >
                        <CalendarClock className="size-4 shrink-0" />
                        {changeStatus.text}
                        {nextTransferSetChange && <span>· due {nextTransferSetChange}</span>}
                    </div>
                )}

                {/* Effluent warning */}
                {latestWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <span>
                            Recent drained fluid was recorded as{' '}
                            <strong>{colorMap[latestWarning.effluent_color!]?.label}</strong>
                            . Cloudy fluid can signal infection (peritonitis) and pink/red
                            can signal bleeding — contact your care team promptly.
                        </span>
                    </div>
                )}

                {/* Catheter details */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <Droplets className="size-5 text-teal-600 dark:text-teal-400" />
                            Tenckhoff catheter
                        </CardTitle>
                        <CatheterDialog catheter={catheter} />
                    </CardHeader>
                    <CardContent>
                        {catheter ? (
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                                <Detail label="Brand" value={catheter.brand} />
                                <Detail label="Type" value={catheter.catheter_type} />
                                <Detail label="Inserted" value={catheter.inserted_on} />
                                <Detail
                                    label="Set last changed"
                                    value={catheter.transfer_set_changed_on}
                                />
                                <Detail
                                    label="Change interval"
                                    value={`${catheter.transfer_set_interval_months} months`}
                                />
                                {catheter.notes && (
                                    <div className="col-span-2 sm:col-span-4">
                                        <dt className="text-muted-foreground">Notes</dt>
                                        <dd>{catheter.notes}</dd>
                                    </div>
                                )}
                            </dl>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No catheter details yet. Add brand, type and the last
                                transfer-set change to get a reminder.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {ufData.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ultrafiltration trend (mL)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={ufData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                    />
                                    <XAxis dataKey="date" fontSize={12} tickMargin={8} />
                                    <YAxis width={44} fontSize={12} />
                                    <Tooltip
                                        cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
                                        content={({ active, payload, label }) =>
                                            active && payload?.length ? (
                                                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                                                    <div className="mb-0.5 text-muted-foreground">
                                                        {label}
                                                    </div>
                                                    <div className="font-medium">
                                                        {(payload[0].value as number) > 0
                                                            ? '+'
                                                            : ''}
                                                        {payload[0].value} mL
                                                    </div>
                                                </div>
                                            ) : null
                                        }
                                    />
                                    <ReferenceLine y={0} stroke="currentColor" />
                                    <Bar dataKey="uf" radius={[4, 4, 0, 0]}>
                                        {ufData.map((d, i) => (
                                            <Cell
                                                key={i}
                                                className={
                                                    d.uf < 0
                                                        ? 'text-rose-500'
                                                        : 'text-teal-500'
                                                }
                                                fill="currentColor"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Ultrafiltration = drain − fill. Negative values (red) mean
                                less came out than went in — mention persistent low or
                                negative UF to your care team.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    {/* Log exchange */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Log an exchange</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="logged_on">Date</Label>
                                    <Input
                                        id="logged_on"
                                        type="date"
                                        max={today}
                                        value={form.data.logged_on}
                                        onChange={(e) =>
                                            form.setData('logged_on', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.logged_on} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fill_volume">Fill (mL)</Label>
                                        <Input
                                            id="fill_volume"
                                            type="number"
                                            min="0"
                                            value={form.data.fill_volume}
                                            onChange={(e) =>
                                                form.setData('fill_volume', e.target.value)
                                            }
                                            placeholder="2000"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="drain_volume">Drain (mL)</Label>
                                        <Input
                                            id="drain_volume"
                                            type="number"
                                            min="0"
                                            value={form.data.drain_volume}
                                            onChange={(e) =>
                                                form.setData('drain_volume', e.target.value)
                                            }
                                            placeholder="2300"
                                        />
                                    </div>
                                </div>
                                {liveUf !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Ultrafiltration:{' '}
                                        <span
                                            className={cn(
                                                'font-medium tabular-nums',
                                                liveUf < 0
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-foreground',
                                            )}
                                        >
                                            {liveUf > 0 ? '+' : ''}
                                            {liveUf} mL
                                        </span>
                                    </p>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="effluent_color">
                                        Drained fluid colour
                                    </Label>
                                    <Select
                                        value={form.data.effluent_color}
                                        onValueChange={(v) =>
                                            form.setData('effluent_color', v)
                                        }
                                    >
                                        <SelectTrigger id="effluent_color" className="w-full">
                                            <SelectValue placeholder="Select colour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colors.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label}
                                                    {c.warning ? ' ⚠️' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.effluent_color} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="log-notes">Note (optional)</Label>
                                    <Input
                                        id="log-notes"
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData('notes', e.target.value)
                                        }
                                    />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Log exchange
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Log list */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Exchange log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {logs.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Nothing logged yet.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="py-2 pr-4 font-medium">Date</th>
                                                <th className="py-2 pr-4 font-medium">Fill</th>
                                                <th className="py-2 pr-4 font-medium">Drain</th>
                                                <th className="py-2 pr-4 font-medium">UF</th>
                                                <th className="py-2 pr-4 font-medium">Colour</th>
                                                <th className="py-2" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((l) => {
                                                const color = l.effluent_color
                                                    ? colorMap[l.effluent_color]
                                                    : null;
                                                return (
                                                    <tr
                                                        key={l.id}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="py-2 pr-4">
                                                            {l.logged_on}
                                                        </td>
                                                        <td className="py-2 pr-4 tabular-nums">
                                                            {l.fill_volume ?? '—'}
                                                        </td>
                                                        <td className="py-2 pr-4 tabular-nums">
                                                            {l.drain_volume ?? '—'}
                                                        </td>
                                                        <td
                                                            className={cn(
                                                                'py-2 pr-4 tabular-nums',
                                                                l.ultrafiltration !== null &&
                                                                    l.ultrafiltration < 0 &&
                                                                    'text-rose-600 dark:text-rose-400',
                                                            )}
                                                        >
                                                            {l.ultrafiltration !== null
                                                                ? `${l.ultrafiltration > 0 ? '+' : ''}${l.ultrafiltration}`
                                                                : '—'}
                                                        </td>
                                                        <td className="py-2 pr-4">
                                                            {color ? (
                                                                <span
                                                                    className={cn(
                                                                        color.warning &&
                                                                            'font-medium text-rose-600 dark:text-rose-400',
                                                                    )}
                                                                >
                                                                    {color.label}
                                                                    {color.warning ? ' ⚠️' : ''}
                                                                </span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            <ConfirmDelete
                                                                onConfirm={() => remove(l.id)}
                                                                title="Delete this entry?"
                                                                trigger={
                                                                    <button className="text-xs text-destructive hover:underline">
                                                                        Delete
                                                                    </button>
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Personal tracking only — not medical advice. Keep the exit site clean
                    and dry, and contact your care team promptly for cloudy or bloody
                    fluid, fever, redness, swelling or pain at the site.
                </p>
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string | null }) {
    return (
        <div>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value || '—'}</dd>
        </div>
    );
}

DialysisIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Dialysis', href: '/dialysis' },
    ],
};
