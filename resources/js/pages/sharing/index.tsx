import { Head, useForm } from '@inertiajs/react';
import { Check, Clock, UserPlus } from 'lucide-react';
import CareShareController from '@/actions/App/Http/Controllers/CareShareController';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { dashboard } from '@/routes';

interface Share {
    id: number;
    email: string;
    label: string | null;
    accepted: boolean;
}

interface PageProps {
    shares: Share[];
}

export default function SharingIndex({ shares }: PageProps) {
    const form = useForm({ caregiver_email: '', label: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(CareShareController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const remove = (id: number) => {
        form.delete(CareShareController.destroy(id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Sharing" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="size-5 text-teal-600 dark:text-teal-400" />
                                Invite a caregiver
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="caregiver_email">Their email</Label>
                                    <Input
                                        id="caregiver_email"
                                        type="email"
                                        value={form.data.caregiver_email}
                                        onChange={(e) =>
                                            form.setData('caregiver_email', e.target.value)
                                        }
                                        placeholder="nurse@example.com"
                                        required
                                    />
                                    <InputError message={form.errors.caregiver_email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="label">Label (optional)</Label>
                                    <Input
                                        id="label"
                                        value={form.data.label}
                                        onChange={(e) => form.setData('label', e.target.value)}
                                        placeholder="e.g. PD nurse, Daughter"
                                    />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Share access
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    They get <strong>read-only</strong> access to your data.
                                    They need a Kidney-Love account with this email; it
                                    appears under their “Shared with me”.
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>People with access</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shares.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    You haven't shared with anyone yet.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {shares.map((s) => (
                                        <li
                                            key={s.id}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                                        >
                                            <div>
                                                <div className="font-medium">{s.email}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    {s.accepted ? (
                                                        <>
                                                            <Check className="size-3 text-emerald-500" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="size-3" />
                                                            Pending — waiting for them to sign in
                                                        </>
                                                    )}
                                                    {s.label ? ` · ${s.label}` : ''}
                                                </div>
                                            </div>
                                            <ConfirmDelete
                                                onConfirm={() => remove(s.id)}
                                                title="Remove access?"
                                                confirmLabel="Remove"
                                                trigger={
                                                    <button className="text-xs text-destructive hover:underline">
                                                        Remove
                                                    </button>
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Caregivers can view but never change your data. Remove access any time.
                </p>
            </div>
        </>
    );
}

SharingIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Sharing', href: '/sharing' },
    ],
};
