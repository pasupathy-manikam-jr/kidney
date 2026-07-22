import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Status = 'in_range' | 'low' | 'high' | 'none';

interface Latest {
    metric: string;
    label: string;
    unit: string;
    referenceRange: [number | null, number | null] | null;
    value: number;
    status: Status;
    measuredAt: string;
}

interface PageProps {
    patientName: string;
    generatedAt: string;
    totalReadings: number;
    latest: Latest[];
    gfr: { code: string; label: string; egfr: number } | null;
    albuminuria: { code: string; label: string; uacr: number } | null;
    risk: { level: number; label: string } | null;
    history: {
        metric: string;
        value: number;
        unit: string;
        measuredAt: string;
        note: string | null;
    }[];
    medications: {
        name: string;
        dosage: string | null;
        frequency: string | null;
        timeOfDay: string | null;
    }[];
    intakeToday: {
        label: string;
        unit: string;
        total: number;
        target: number | null;
    }[];
    symptoms: {
        symptom: string;
        severity: number;
        note: string | null;
        loggedOn: string;
    }[];
}

const STATUS_TEXT: Record<Status, string> = {
    in_range: 'text-emerald-600',
    low: 'text-amber-600',
    high: 'text-rose-600',
    none: 'text-foreground',
};

const STATUS_LABEL: Record<Status, string> = {
    in_range: 'In range',
    low: 'Below',
    high: 'Above',
    none: '—',
};

function refRange(r: Latest['referenceRange'], unit: string): string {
    if (!r) return '—';
    const [low, high] = r;
    if (low !== null && high !== null) return `${low}–${high} ${unit}`;
    if (low !== null) return `≥${low} ${unit}`;
    if (high !== null) return `<${high} ${unit}`;
    return '—';
}

export default function Report({
    patientName,
    generatedAt,
    totalReadings,
    latest,
    gfr,
    albuminuria,
    risk,
    history,
    medications,
    intakeToday,
    symptoms,
}: PageProps) {
    return (
        <>
            <Head title="Report — Kidney-Love" />

            <div className="mx-auto max-w-3xl bg-white p-4 text-neutral-900 sm:p-8 print:p-0">
                {/* Toolbar (hidden in print) */}
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                    >
                        <ArrowLeft className="size-4" /> Back to dashboard
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        <Printer className="size-4" /> Print / Save PDF
                    </button>
                </div>

                {/* Header */}
                <header className="mb-6 border-b border-neutral-200 pb-4">
                    <h1 className="text-2xl font-bold">Kidney-Love — Kidney Health Report</h1>
                    <div className="mt-1 text-sm text-neutral-500">
                        {patientName} · Generated {generatedAt} · {totalReadings} readings
                    </div>
                </header>

                {/* Summary */}
                <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 print:grid-cols-3">
                    <div className="rounded-lg border border-neutral-200 p-3">
                        <div className="text-xs text-neutral-500">GFR category</div>
                        <div className="text-lg font-semibold">{gfr?.code ?? '—'}</div>
                        <div className="text-xs text-neutral-500">
                            {gfr ? `eGFR ${gfr.egfr} · ${gfr.label}` : 'No eGFR reading'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-3">
                        <div className="text-xs text-neutral-500">Albuminuria</div>
                        <div className="text-lg font-semibold">
                            {albuminuria?.code ?? '—'}
                        </div>
                        <div className="text-xs text-neutral-500">
                            {albuminuria
                                ? `UACR ${albuminuria.uacr} · ${albuminuria.label}`
                                : 'No UACR reading'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-neutral-200 p-3">
                        <div className="text-xs text-neutral-500">KDIGO risk</div>
                        <div className="text-lg font-semibold">
                            {risk?.label ?? '—'}
                        </div>
                        <div className="text-xs text-neutral-500">
                            {risk ? 'GFR × albuminuria' : 'Needs eGFR + UACR'}
                        </div>
                    </div>
                </section>

                {/* Latest values */}
                <section className="mb-6">
                    <h2 className="mb-2 font-semibold">Latest values</h2>
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm print:min-w-0">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                <th className="py-1.5 pr-4 font-medium">Metric</th>
                                <th className="py-1.5 pr-4 font-medium">Value</th>
                                <th className="py-1.5 pr-4 font-medium">Reference</th>
                                <th className="py-1.5 pr-4 font-medium">Status</th>
                                <th className="py-1.5 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latest.map((m) => (
                                <tr key={m.metric} className="border-b border-neutral-100">
                                    <td className="py-1.5 pr-4">{m.label}</td>
                                    <td className="py-1.5 pr-4 font-medium">
                                        {m.value} {m.unit}
                                    </td>
                                    <td className="py-1.5 pr-4 text-neutral-500">
                                        {refRange(m.referenceRange, m.unit)}
                                    </td>
                                    <td
                                        className={cn(
                                            'py-1.5 pr-4 font-medium',
                                            STATUS_TEXT[m.status],
                                        )}
                                    >
                                        {STATUS_LABEL[m.status]}
                                    </td>
                                    <td className="py-1.5 text-neutral-500">
                                        {m.measuredAt}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </section>

                {/* Medications */}
                <section className="mb-6">
                    <h2 className="mb-2 font-semibold">Current medications</h2>
                    {medications.length === 0 ? (
                        <p className="text-sm text-neutral-500">None recorded.</p>
                    ) : (
                        <ul className="grid gap-1 text-sm sm:grid-cols-2 print:grid-cols-2">
                            {medications.map((m, i) => (
                                <li key={i} className="rounded border border-neutral-200 px-3 py-2">
                                    <span className="font-medium">{m.name}</span>
                                    {m.dosage && <span> · {m.dosage}</span>}
                                    <div className="text-xs text-neutral-500">
                                        {[m.frequency, m.timeOfDay].filter(Boolean).join(' · ') || '—'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Today's intake */}
                <section className="mb-6">
                    <h2 className="mb-2 font-semibold">Today's diet &amp; fluid</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 print:grid-cols-4">
                        {intakeToday.map((c, i) => (
                            <div key={i} className="rounded border border-neutral-200 px-3 py-2">
                                <div className="text-xs text-neutral-500">{c.label}</div>
                                <div className="font-medium">
                                    {c.total} {c.unit}
                                    {c.target ? (
                                        <span className="text-neutral-500"> / {c.target}</span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Symptoms */}
                <section className="mb-6">
                    <h2 className="mb-2 font-semibold">Recent symptoms</h2>
                    {symptoms.length === 0 ? (
                        <p className="text-sm text-neutral-500">None recorded.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[420px] text-sm print:min-w-0">
                                <thead>
                                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                        <th className="py-1.5 pr-4 font-medium">Date</th>
                                        <th className="py-1.5 pr-4 font-medium">Symptom</th>
                                        <th className="py-1.5 pr-4 font-medium">Severity</th>
                                        <th className="py-1.5 font-medium">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {symptoms.map((s, i) => (
                                        <tr key={i} className="border-b border-neutral-100">
                                            <td className="py-1.5 pr-4">{s.loggedOn}</td>
                                            <td className="py-1.5 pr-4">{s.symptom}</td>
                                            <td className="py-1.5 pr-4">{s.severity}/5</td>
                                            <td className="py-1.5 text-neutral-500">{s.note ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Full history */}
                <section className="mb-6">
                    <h2 className="mb-2 font-semibold">Full lab history</h2>
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm print:min-w-0">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                <th className="py-1.5 pr-4 font-medium">Date</th>
                                <th className="py-1.5 pr-4 font-medium">Metric</th>
                                <th className="py-1.5 pr-4 font-medium">Value</th>
                                <th className="py-1.5 font-medium">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} className="border-b border-neutral-100">
                                    <td className="py-1.5 pr-4">{h.measuredAt}</td>
                                    <td className="py-1.5 pr-4">{h.metric}</td>
                                    <td className="py-1.5 pr-4">
                                        {h.value} {h.unit}
                                    </td>
                                    <td className="py-1.5 text-neutral-500">
                                        {h.note ?? ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </section>

                <footer className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
                    Personal tracking only — not medical advice or a diagnosis. Reference
                    ranges are general adult values; confirm with the lab report and care
                    team.
                </footer>
            </div>
        </>
    );
}
