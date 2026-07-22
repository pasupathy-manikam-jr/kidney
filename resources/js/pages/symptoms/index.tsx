import { Head, useForm } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';
import SymptomEntryController from '@/actions/App/Http/Controllers/SymptomEntryController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface Entry {
    id: number;
    symptom: string;
    severity: number;
    note: string | null;
    logged_on: string;
}

interface PageProps {
    entries: Entry[];
    today: string;
}

const SEVERITY_STYLE: Record<number, string> = {
    1: 'bg-emerald-500',
    2: 'bg-lime-500',
    3: 'bg-amber-500',
    4: 'bg-orange-500',
    5: 'bg-rose-600',
};

const SEVERITY_LABEL: Record<number, string> = {
    1: 'Very mild',
    2: 'Mild',
    3: 'Moderate',
    4: 'Severe',
    5: 'Very severe',
};

const COMMON = [
    'Fatigue',
    'Swelling',
    'Nausea',
    'Itching',
    'Cramps',
    'Shortness of breath',
    'Poor appetite',
    'Trouble sleeping',
];

export default function SymptomsIndex({ entries, today }: PageProps) {
    const form = useForm({
        symptom: '',
        severity: 3,
        note: '',
        logged_on: today,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(SymptomEntryController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset('symptom', 'note'),
        });
    };

    const remove = (id: number) => {
        if (!confirm('Delete this entry?')) return;
        form.delete(SymptomEntryController.destroy(id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Symptom Journal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    {/* Add form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Log a symptom</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="symptom">Symptom</Label>
                                    <Input
                                        id="symptom"
                                        value={form.data.symptom}
                                        onChange={(e) => form.setData('symptom', e.target.value)}
                                        placeholder="e.g. Fatigue"
                                        required
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {COMMON.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => form.setData('symptom', c)}
                                                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={form.errors.symptom} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Severity · {SEVERITY_LABEL[form.data.severity]}</Label>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => form.setData('severity', n)}
                                                className={cn(
                                                    'flex h-9 flex-1 items-center justify-center rounded-md text-sm font-medium transition',
                                                    form.data.severity === n
                                                        ? cn('text-white', SEVERITY_STYLE[n])
                                                        : 'border border-border text-muted-foreground hover:bg-muted',
                                                )}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={form.errors.severity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="note">Note (optional)</Label>
                                    <Input
                                        id="note"
                                        value={form.data.note}
                                        onChange={(e) => form.setData('note', e.target.value)}
                                        placeholder="Context, triggers…"
                                    />
                                    <InputError message={form.errors.note} />
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
                                    Log symptom
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Journal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Journal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {entries.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
                                    <HeartPulse className="size-8 opacity-50" />
                                    No symptoms logged yet.
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-2.5">
                                    {entries.map((e) => (
                                        <li
                                            key={e.id}
                                            className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span
                                                    className={cn(
                                                        'mt-0.5 flex size-8 items-center justify-center rounded-md text-xs font-bold text-white',
                                                        SEVERITY_STYLE[e.severity],
                                                    )}
                                                    title={SEVERITY_LABEL[e.severity]}
                                                >
                                                    {e.severity}
                                                </span>
                                                <div>
                                                    <div className="font-medium">{e.symptom}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {e.logged_on}
                                                        {e.note ? ` · ${e.note}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => remove(e.id)}
                                                className="shrink-0 text-xs text-destructive hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    A journal to share with your care team. If symptoms are severe or
                    sudden, contact your care team or seek urgent care — don't wait.
                </p>
            </div>
        </>
    );
}

SymptomsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Symptoms', href: '/symptoms' },
    ],
};
