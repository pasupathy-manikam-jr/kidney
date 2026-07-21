import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Single source of truth: the user guide markdown file.
import guideContent from '../../../docs/USER_GUIDE.md?raw';
import { home } from '@/routes';

const components = {
    h1: (p: ComponentPropsWithoutRef<'h1'>) => (
        <h1 className="mt-2 mb-4 text-3xl font-bold tracking-tight" {...p} />
    ),
    h2: (p: ComponentPropsWithoutRef<'h2'>) => (
        <h2 className="mt-10 mb-3 border-b border-border pb-2 text-xl font-semibold" {...p} />
    ),
    h3: (p: ComponentPropsWithoutRef<'h3'>) => (
        <h3 className="mt-6 mb-2 font-semibold" {...p} />
    ),
    p: (p: ComponentPropsWithoutRef<'p'>) => (
        <p className="my-3 leading-relaxed text-muted-foreground" {...p} />
    ),
    ul: (p: ComponentPropsWithoutRef<'ul'>) => (
        <ul className="my-3 ml-5 list-disc space-y-1.5 text-muted-foreground" {...p} />
    ),
    ol: (p: ComponentPropsWithoutRef<'ol'>) => (
        <ol className="my-3 ml-5 list-decimal space-y-1.5 text-muted-foreground" {...p} />
    ),
    li: (p: ComponentPropsWithoutRef<'li'>) => <li className="pl-1" {...p} />,
    a: (p: ComponentPropsWithoutRef<'a'>) => (
        <a className="font-medium text-teal-600 underline underline-offset-4 dark:text-teal-400" {...p} />
    ),
    strong: (p: ComponentPropsWithoutRef<'strong'>) => (
        <strong className="font-semibold text-foreground" {...p} />
    ),
    blockquote: (p: ComponentPropsWithoutRef<'blockquote'>) => (
        <blockquote
            className="my-4 rounded-r-md border-l-4 border-amber-500/60 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            {...p}
        />
    ),
    code: (p: ComponentPropsWithoutRef<'code'>) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...p} />
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: (p: ComponentPropsWithoutRef<'table'>) => (
        <div className="my-4 overflow-x-auto">
            <table className="w-full text-sm" {...p} />
        </div>
    ),
    th: (p: ComponentPropsWithoutRef<'th'>) => (
        <th className="border-b border-border py-2 pr-4 text-left font-medium" {...p} />
    ),
    td: (p: ComponentPropsWithoutRef<'td'>) => (
        <td className="border-b border-border py-2 pr-4 text-muted-foreground" {...p} />
    ),
};

export default function Guide() {
    return (
        <>
            <Head title="User Guide — KidneyLove" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
                    <Link href={home()} className="flex items-center gap-2 font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                            <HeartPulse className="size-5" />
                        </span>
                        KidneyLove
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" /> Back home
                    </Link>
                </header>

                <main className="mx-auto max-w-3xl px-6 pb-20">
                    <Markdown remarkPlugins={[remarkGfm]} components={components}>
                        {guideContent}
                    </Markdown>
                </main>
            </div>
        </>
    );
}
