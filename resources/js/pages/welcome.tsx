import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    FileText,
    HeartPulse,
    Menu,
    NotebookPen,
    Pill,
    ShieldCheck,
    Utensils,
} from 'lucide-react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, guide, home, login, register } from '@/routes';

const features = [
    {
        icon: Activity,
        title: 'Track key labs',
        body: 'Log eGFR, creatinine, potassium, phosphorus, albuminuria, BP and more — with trends, reference bands and a built-in eGFR calculator.',
    },
    {
        icon: ShieldCheck,
        title: 'KDIGO risk map',
        body: 'Your latest eGFR and albuminuria place you on the standard GFR × albuminuria risk grid, colour-coded from low to very high.',
    },
    {
        icon: Pill,
        title: 'Medications & reminders',
        body: 'Keep your medication list with dosages and get in-app reminders at the times you set.',
    },
    {
        icon: Utensils,
        title: 'Diet & fluid',
        body: 'Track fluid, sodium, potassium and phosphorus against daily targets you can set yourself.',
    },
    {
        icon: NotebookPen,
        title: 'Symptom journal',
        body: 'Note symptoms and severity over time so patterns are easy to share at appointments.',
    },
    {
        icon: FileText,
        title: 'One-tap report',
        body: 'Generate a printable summary — labs, meds, diet, symptoms and risk — to hand to your care team.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Kidney-Love — track your kidney health" />

            <div className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background text-foreground dark:from-teal-950/30">
                {/* Nav */}
                <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <Link
                        href={home()}
                        className="flex shrink-0 items-center gap-2 font-semibold"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                            <HeartPulse className="size-5" />
                        </span>
                        Kidney-Love
                    </Link>
                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-2 sm:flex">
                        <Link
                            href={guide()}
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            User guide
                        </Link>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition hover:bg-teal-700"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition hover:bg-teal-700"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile hamburger */}
                    <Sheet>
                        <SheetTrigger
                            aria-label="Open menu"
                            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted sm:hidden"
                        >
                            <Menu className="size-5" />
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                                        <HeartPulse className="size-4" />
                                    </span>
                                    Kidney-Love
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 px-4">
                                <SheetClose asChild>
                                    <Link
                                        href={guide()}
                                        className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                    >
                                        User guide
                                    </Link>
                                </SheetClose>
                                {auth.user ? (
                                    <SheetClose asChild>
                                        <Link
                                            href={dashboard()}
                                            className="mt-1 rounded-md bg-teal-600 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-teal-700"
                                        >
                                            Dashboard
                                        </Link>
                                    </SheetClose>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Link
                                                href={login()}
                                                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                            >
                                                Log in
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href={register()}
                                                className="mt-1 rounded-md bg-teal-600 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-teal-700"
                                            >
                                                Get started
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Hero */}
                <main className="mx-auto max-w-5xl px-6">
                    <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
                        <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300">
                            <HeartPulse className="size-3.5" /> Kidney health, tracked simply
                        </span>
                        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                            Understand your kidney numbers over time
                        </h1>
                        <p className="max-w-xl text-lg text-muted-foreground">
                            Track labs, medications, diet & fluid and symptoms — see
                            your trends and KDIGO risk, and print a report for every
                            appointment. All in one calm, private place.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                            >
                                {auth.user ? 'Open dashboard' : 'Start tracking free'}
                            </Link>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="rounded-lg border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
                                >
                                    I already have an account
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* Features */}
                    <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-xl border border-border bg-card p-6 transition hover:shadow-md"
                            >
                                <span className="flex size-10 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 dark:text-teal-400">
                                    <f.icon className="size-5" />
                                </span>
                                <h3 className="mt-4 font-semibold">{f.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {f.body}
                                </p>
                            </div>
                        ))}
                    </section>

                    {/* Disclaimer */}
                    <section className="pb-16">
                        <p className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            Kidney-Love is a personal tracking tool — not medical advice
                            or a diagnosis. Reference ranges are general adult values.
                            Always confirm every result with your lab report and care team.
                        </p>
                    </section>
                </main>

                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                    Built with care for people managing kidney health. ·{' '}
                    <Link
                        href={guide()}
                        className="font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                        Read the user guide
                    </Link>
                </footer>
            </div>
        </>
    );
}
