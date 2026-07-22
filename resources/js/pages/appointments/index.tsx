import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import AppointmentController from '@/actions/App/Http/Controllers/AppointmentController';
import { ConfirmDelete } from '@/components/confirm-delete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface Appointment {
    id: number;
    title: string;
    scheduled_for: string;
    time_of_day: string | null;
    location: string | null;
    notes: string | null;
}

interface PageProps {
    appointments: Appointment[];
    today: string;
}

export default function AppointmentsIndex({ appointments, today }: PageProps) {
    const form = useForm({
        title: '',
        scheduled_for: '',
        time_of_day: '',
        location: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(AppointmentController.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const remove = (id: number) => {
        form.delete(AppointmentController.destroy(id).url, { preserveScroll: true });
    };

    const { upcoming, past } = useMemo(() => {
        const up: Appointment[] = [];
        const pa: Appointment[] = [];
        for (const a of appointments) {
            (a.scheduled_for >= today ? up : pa).push(a);
        }
        return { upcoming: up, past: pa.reverse() };
    }, [appointments, today]);

    const row = (a: Appointment, isUpcoming: boolean) => (
        <li
            key={a.id}
            className={cn(
                'flex items-start justify-between gap-4 rounded-lg border border-border p-4',
                !isUpcoming && 'opacity-70',
            )}
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                    <CalendarDays className="size-4" />
                </span>
                <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-muted-foreground">
                        {a.scheduled_for}
                        {a.time_of_day ? ` · ${a.time_of_day}` : ''}
                        {isUpcoming && a.scheduled_for === today && ' · Today'}
                    </div>
                    {a.location && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" /> {a.location}
                        </div>
                    )}
                    {a.notes && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                            {a.notes}
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDelete
                onConfirm={() => remove(a.id)}
                title="Remove this appointment?"
                confirmLabel="Remove"
                trigger={
                    <button className="shrink-0 text-xs text-destructive hover:underline">
                        Remove
                    </button>
                }
            />
        </li>
    );

    return (
        <>
            <Head title="Appointments" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                    {/* Add form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add appointment / test</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        placeholder="e.g. Nephrology clinic, Blood test"
                                        required
                                    />
                                    <InputError message={form.errors.title} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="scheduled_for">Date</Label>
                                        <Input
                                            id="scheduled_for"
                                            type="date"
                                            value={form.data.scheduled_for}
                                            onChange={(e) =>
                                                form.setData('scheduled_for', e.target.value)
                                            }
                                            required
                                        />
                                        <InputError message={form.errors.scheduled_for} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="time_of_day">Time</Label>
                                        <Input
                                            id="time_of_day"
                                            type="time"
                                            value={form.data.time_of_day}
                                            onChange={(e) =>
                                                form.setData('time_of_day', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={form.data.location}
                                        onChange={(e) =>
                                            form.setData('location', e.target.value)
                                        }
                                        placeholder="Clinic / hospital"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={form.processing}>
                                    Add
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Lists */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcoming.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        No upcoming appointments.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-3">
                                        {upcoming.map((a) => row(a, true))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {past.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Past</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="flex flex-col gap-3">
                                        {past.map((a) => row(a, false))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AppointmentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Appointments', href: '/appointments' },
    ],
};
