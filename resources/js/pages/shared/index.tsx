import { Head, router } from '@inertiajs/react';
import { Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

interface Patient {
    shareId: number;
    patientName: string | null;
    patientEmail: string | null;
    label: string | null;
}

interface PageProps {
    patients: Patient[];
}

export default function SharedIndex({ patients }: PageProps) {
    return (
        <>
            <Head title="Shared with me" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-teal-600 dark:text-teal-400" />
                            Patients shared with me
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {patients.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No one has shared their data with you yet. Ask them to
                                invite your account email under their Sharing page.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {patients.map((p) => (
                                    <li
                                        key={p.shareId}
                                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {p.patientName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.patientEmail}
                                                {p.label ? ` · ${p.label}` : ''}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.post(`/shared/${p.shareId}/view`)
                                            }
                                        >
                                            <Eye className="size-4" /> View
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Viewing is read-only — you can see the patient's data but can't
                    change anything.
                </p>
            </div>
        </>
    );
}

SharedIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Shared with me', href: '/shared' },
    ],
};
