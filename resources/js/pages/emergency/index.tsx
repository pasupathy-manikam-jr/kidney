import { Head, useForm } from '@inertiajs/react';
import { Phone, Plus, Siren, Trash2 } from 'lucide-react';
import EmergencyController from '@/actions/App/Http/Controllers/EmergencyController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';

interface Contact {
    name: string;
    role: string;
    phone: string;
}

interface PageProps {
    contacts: Contact[];
}

const WHEN_TO_CALL = [
    'Cloudy, pink or bloody fluid draining from your dialysis catheter.',
    'Fever, chills, or redness, swelling, pus or pain at the catheter exit site.',
    'Chest pain, trouble breathing, or severe swelling.',
    'Muscle weakness, irregular heartbeat, or numbness (possible high potassium).',
    'Passing very little or no urine, or sudden weight gain from fluid.',
    'Confusion, severe nausea/vomiting, or unable to keep fluids down.',
];

export default function EmergencyIndex({ contacts }: PageProps) {
    const form = useForm<{ contacts: Contact[] }>({
        contacts:
            contacts.length > 0
                ? contacts
                : [{ name: '', role: '', phone: '' }],
    });

    const update = (i: number, key: keyof Contact, value: string) => {
        const next = form.data.contacts.map((c, idx) =>
            idx === i ? { ...c, [key]: value } : c,
        );
        form.setData('contacts', next);
    };

    const addRow = () =>
        form.setData('contacts', [
            ...form.data.contacts,
            { name: '', role: '', phone: '' },
        ]);

    const removeRow = (i: number) =>
        form.setData(
            'contacts',
            form.data.contacts.filter((_, idx) => idx !== i),
        );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(EmergencyController.update().url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Emergency" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* When to call */}
                <Card className="border-rose-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Siren className="size-5 text-rose-600 dark:text-rose-400" />
                            When to get help urgently
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-3 text-sm text-muted-foreground">
                            Contact your care team promptly — or emergency services if
                            severe — for any of these. General guidance only; follow your
                            own care team's advice.
                        </p>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {WHEN_TO_CALL.map((w) => (
                                <li
                                    key={w}
                                    className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
                                >
                                    <span className="mt-0.5">•</span>
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Contacts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="size-5 text-teal-600 dark:text-teal-400" />
                            Care team contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            {form.data.contacts.map((c, i) => (
                                <div
                                    key={i}
                                    className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
                                >
                                    <Input
                                        placeholder="Name"
                                        value={c.name}
                                        onChange={(e) => update(i, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Role (e.g. PD nurse)"
                                        value={c.role}
                                        onChange={(e) => update(i, 'role', e.target.value)}
                                    />
                                    <Input
                                        type="tel"
                                        placeholder="Phone"
                                        value={c.phone}
                                        onChange={(e) => update(i, 'phone', e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRow(i)}
                                        aria-label="Remove contact"
                                    >
                                        <Trash2 className="size-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                                    <Plus className="size-4" /> Add contact
                                </Button>
                                <Button type="submit" size="sm" disabled={form.processing}>
                                    Save contacts
                                </Button>
                            </div>
                        </form>

                        {contacts.length > 0 && (
                            <div className="mt-6 grid gap-2 sm:grid-cols-2">
                                {contacts.map((c, i) => (
                                    <a
                                        key={i}
                                        href={c.phone ? `tel:${c.phone}` : undefined}
                                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition hover:bg-muted"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {c.name || 'Contact'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.role}
                                            </div>
                                        </div>
                                        {c.phone && (
                                            <span className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400">
                                                <Phone className="size-4" /> {c.phone}
                                            </span>
                                        )}
                                    </a>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    In a life-threatening emergency, call your local emergency number
                    immediately. This page is a personal quick-reference, not medical
                    advice.
                </p>
            </div>
        </>
    );
}

EmergencyIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Emergency', href: '/emergency' },
    ],
};
