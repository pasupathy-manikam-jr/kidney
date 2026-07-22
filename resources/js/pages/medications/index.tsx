import { Head, router, useForm } from '@inertiajs/react';
import { Pill } from 'lucide-react';
import MedicationController from '@/actions/App/Http/Controllers/MedicationController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface Medication {
    id: number;
    name: string;
    dosage: string | null;
    frequency: string | null;
    time_of_day: string | null;
    notes: string | null;
    active: boolean;
}

interface PageProps {
    medications: Medication[];
}

export default function MedicationsIndex({ medications }: PageProps) {
    const form = useForm({
        name: '',
        dosage: '',
        frequency: '',
        time_of_day: '',
        notes: '',
        active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(MedicationController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (m: Medication) => {
        router.put(
            MedicationController.update(m.id).url,
            {
                name: m.name,
                dosage: m.dosage ?? '',
                frequency: m.frequency ?? '',
                time_of_day: m.time_of_day ?? '',
                notes: m.notes ?? '',
                active: !m.active,
            },
            { preserveScroll: true },
        );
    };

    const remove = (id: number) => {
        if (!confirm('Remove this medication?')) return;
        form.delete(MedicationController.destroy(id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Medications" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    {/* Add form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add a medication</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. Amlodipine"
                                        required
                                    />
                                    <InputError message={form.errors.name} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="dosage">Dosage</Label>
                                        <Input
                                            id="dosage"
                                            value={form.data.dosage}
                                            onChange={(e) => form.setData('dosage', e.target.value)}
                                            placeholder="5 mg"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time_of_day">Time</Label>
                                        <Input
                                            id="time_of_day"
                                            value={form.data.time_of_day}
                                            onChange={(e) => form.setData('time_of_day', e.target.value)}
                                            placeholder="Morning"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="frequency">Frequency</Label>
                                    <Input
                                        id="frequency"
                                        value={form.data.frequency}
                                        onChange={(e) => form.setData('frequency', e.target.value)}
                                        placeholder="Once daily"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (optional)</Label>
                                    <Input
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        placeholder="With food"
                                    />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Add medication
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your medications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {medications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
                                    <Pill className="size-8 opacity-50" />
                                    No medications yet. Add your first on the left.
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {medications.map((m) => (
                                        <li
                                            key={m.id}
                                            className={cn(
                                                'flex items-start justify-between gap-4 rounded-lg border border-border p-4',
                                                !m.active && 'opacity-60',
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                                                    <Pill className="size-4" />
                                                </span>
                                                <div>
                                                    <div className="font-medium">
                                                        {m.name}{' '}
                                                        {m.dosage && (
                                                            <span className="text-muted-foreground">
                                                                · {m.dosage}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {[m.frequency, m.time_of_day]
                                                            .filter(Boolean)
                                                            .join(' · ') || '—'}
                                                    </div>
                                                    {m.notes && (
                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                            {m.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                <button
                                                    onClick={() => toggleActive(m)}
                                                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                                >
                                                    {m.active ? 'Mark inactive' : 'Mark active'}
                                                </button>
                                                <button
                                                    onClick={() => remove(m.id)}
                                                    className="text-xs text-destructive hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    A personal list for your reference and appointments — not a
                    prescription. Never change doses without your care team.
                </p>
            </div>
        </>
    );
}

MedicationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Medications', href: '/medications' },
    ],
};
