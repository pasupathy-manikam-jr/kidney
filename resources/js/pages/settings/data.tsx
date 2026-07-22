import { Head, useForm } from '@inertiajs/react';
import { Download, Upload } from 'lucide-react';
import BackupController from '@/actions/App/Http/Controllers/Settings/BackupController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

interface PageProps {
    counts: {
        labResults: number;
        medications: number;
        intakeEntries: number;
        symptomEntries: number;
        catheterLogs: number;
    };
}

export default function DataSettings({ counts }: PageProps) {
    const importForm = useForm<{ file: File | null }>({ file: null });

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (
            !confirm(
                'Restoring will replace ALL current data in this account with the backup. Continue?',
            )
        ) {
            e.target.value = '';
            return;
        }
        importForm.setData('file', file);
        importForm.post(BackupController.import().url, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                e.target.value = '';
                importForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Data & backup" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Data & backup"
                    description="Export all your data as a file, or restore it from a backup."
                />

                <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                    This account holds {counts.labResults} lab readings,{' '}
                    {counts.medications} medications, {counts.intakeEntries} diet/fluid
                    entries, {counts.symptomEntries} symptoms and {counts.catheterLogs}{' '}
                    dialysis exchanges.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <a href={BackupController.export().url}>
                        <Button type="button" variant="outline">
                            <Download className="size-4" /> Export backup (JSON)
                        </Button>
                    </a>
                    <label>
                        <input
                            type="file"
                            accept=".json,application/json"
                            className="hidden"
                            onChange={handleImport}
                            disabled={importForm.processing}
                        />
                        <Button type="button" variant="outline" asChild disabled={importForm.processing}>
                            <span className="cursor-pointer">
                                <Upload className="size-4" /> Restore from backup
                            </span>
                        </Button>
                    </label>
                </div>

                <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Restoring replaces everything currently in this account with the
                    contents of the backup file. Export first if you're unsure.
                </p>
            </div>
        </>
    );
}
