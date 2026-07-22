import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import IntakeEntryController from '@/actions/App/Http/Controllers/IntakeEntryController';
import IntakeTargetController from '@/actions/App/Http/Controllers/IntakeTargetController';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

interface CategoryInfo {
    value: string;
    label: string;
    unit: string;
    suggestedLimit: number | null;
}

interface Entry {
    id: number;
    category: string;
    amount: string;
    unit: string;
    label: string | null;
    logged_on: string;
}

interface PageProps {
    entries: Entry[];
    catalog: CategoryInfo[];
    targets: Record<string, number | null>;
    customTargets: Record<string, number | null>;
    today: string;
}

function TargetsDialog({
    catalog,
    customTargets,
}: {
    catalog: CategoryInfo[];
    customTargets: Record<string, number | null>;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm<Record<string, string>>(
        Object.fromEntries(
            catalog.map((c) => [c.value, customTargets[c.value]?.toString() ?? '']),
        ),
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(IntakeTargetController.update().url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                    <SlidersHorizontal className="size-4" /> Set targets
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Daily targets</DialogTitle>
                    <DialogDescription>
                        Leave blank to use the general suggested limit. Set your own to
                        match your care team's advice.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {catalog.map((c) => (
                        <div key={c.value} className="grid gap-2">
                            <Label htmlFor={`t-${c.value}`}>
                                {c.label}{' '}
                                <span className="text-muted-foreground">({c.unit})</span>
                            </Label>
                            <Input
                                id={`t-${c.value}`}
                                type="number"
                                min="1"
                                value={form.data[c.value]}
                                onChange={(e) => form.setData(c.value, e.target.value)}
                                placeholder={
                                    c.suggestedLimit
                                        ? `Suggested: ${c.suggestedLimit}`
                                        : 'No suggestion'
                                }
                            />
                        </div>
                    ))}
                    <DialogFooter>
                        <Button type="submit" disabled={form.processing}>
                            Save targets
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function IntakeIndex({
    entries,
    catalog,
    targets,
    customTargets,
    today,
}: PageProps) {
    const catalogMap = useMemo(
        () => Object.fromEntries(catalog.map((c) => [c.value, c])),
        [catalog],
    );

    const form = useForm({
        category: catalog[0]?.value ?? '',
        amount: '',
        label: '',
        logged_on: today,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(IntakeEntryController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset('amount', 'label'),
        });
    };

    const remove = (id: number) => {
        form.delete(IntakeEntryController.destroy(id).url, { preserveScroll: true });
    };

    // Today's total per category.
    const todayTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        for (const c of catalog) totals[c.value] = 0;
        for (const e of entries) {
            if (e.logged_on === today) {
                totals[e.category] = (totals[e.category] ?? 0) + Number(e.amount);
            }
        }
        return totals;
    }, [entries, catalog, today]);

    // Entries grouped by day (already newest-first).
    const byDay = useMemo(() => {
        const groups: { day: string; items: Entry[] }[] = [];
        for (const e of entries) {
            let g = groups.find((x) => x.day === e.logged_on);
            if (!g) {
                g = { day: e.logged_on, items: [] };
                groups.push(g);
            }
            g.items.push(e);
        }
        return groups;
    }, [entries]);

    return (
        <>
            <Head title="Diet & Fluid Log" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-semibold">Today's totals</h1>
                    <TargetsDialog catalog={catalog} customTargets={customTargets} />
                </div>

                {/* Today's totals */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {catalog.map((c) => {
                        const total = Math.round(todayTotals[c.value] ?? 0);
                        const limit = targets[c.value] ?? c.suggestedLimit;
                        const pct = limit
                            ? Math.min(100, Math.round((total / limit) * 100))
                            : 0;
                        const over = limit ? total > limit : false;
                        return (
                            <Card key={c.value}>
                                <CardContent className="pt-6">
                                    <div className="text-sm text-muted-foreground">
                                        {c.label} today
                                    </div>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span
                                            className={cn(
                                                'text-2xl font-semibold tabular-nums',
                                                over && 'text-rose-600 dark:text-rose-400',
                                            )}
                                        >
                                            {total}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {c.unit}
                                            {limit ? ` / ${limit}` : ''}
                                        </span>
                                    </div>
                                    {limit && (
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    over ? 'bg-rose-500' : 'bg-teal-500',
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    {/* Add form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Log intake</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={form.data.category}
                                        onValueChange={(v) => form.setData('category', v)}
                                    >
                                        <SelectTrigger id="category" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {catalog.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    {c.label} ({c.unit})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.category} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">
                                        Amount{' '}
                                        {catalogMap[form.data.category] && (
                                            <span className="text-muted-foreground">
                                                ({catalogMap[form.data.category].unit})
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={form.data.amount}
                                        onChange={(e) => form.setData('amount', e.target.value)}
                                        required
                                    />
                                    <InputError message={form.errors.amount} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="label">Label (optional)</Label>
                                    <Input
                                        id="label"
                                        value={form.data.label}
                                        onChange={(e) => form.setData('label', e.target.value)}
                                        placeholder="e.g. Coffee, banana"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="logged_on">Date</Label>
                                    <Input
                                        id="logged_on"
                                        type="date"
                                        max={today}
                                        value={form.data.logged_on}
                                        onChange={(e) => form.setData('logged_on', e.target.value)}
                                        required
                                    />
                                    <InputError message={form.errors.logged_on} />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Log entry
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {byDay.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Nothing logged yet.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {byDay.map((g) => (
                                        <div key={g.day}>
                                            <div className="mb-2 text-sm font-medium text-muted-foreground">
                                                {g.day}
                                                {g.day === today && ' · Today'}
                                            </div>
                                            <ul className="flex flex-col gap-1.5">
                                                {g.items.map((e) => (
                                                    <li
                                                        key={e.id}
                                                        className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2 text-sm"
                                                    >
                                                        <span>
                                                            <span className="font-medium">
                                                                {catalogMap[e.category]?.label ??
                                                                    e.category}
                                                            </span>
                                                            {e.label && (
                                                                <span className="text-muted-foreground">
                                                                    {' '}
                                                                    · {e.label}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="flex items-center gap-3">
                                                            <span className="tabular-nums">
                                                                {Number(e.amount)} {e.unit}
                                                            </span>
                                                            <ConfirmDelete
                                                                onConfirm={() => remove(e.id)}
                                                                title="Delete this entry?"
                                                                trigger={
                                                                    <button className="text-xs text-destructive hover:underline">
                                                                        Delete
                                                                    </button>
                                                                }
                                                            />
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Suggested limits are general CKD-oriented values, not a prescription.
                    Your target fluid and diet limits come from your care team.
                </p>
            </div>
        </>
    );
}

IntakeIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Diet & Fluid', href: '/intake' },
    ],
};
