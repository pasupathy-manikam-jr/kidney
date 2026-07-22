import { Head, Link } from '@inertiajs/react';
import GithubSlugger from 'github-slugger';
import { ArrowLeft, HeartPulse } from 'lucide-react';
import { type ComponentPropsWithoutRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
// Single source of truth: the user guide markdown file.
import guideContent from '../../../docs/USER_GUIDE.md?raw';
import { home } from '@/routes';

const components = {
    h1: (p: ComponentPropsWithoutRef<'h1'>) => (
        <h1 className="mt-2 mb-4 text-3xl font-bold tracking-tight" {...p} />
    ),
    h2: (p: ComponentPropsWithoutRef<'h2'>) => (
        <h2
            className="mt-10 mb-3 scroll-mt-6 border-b border-border pb-2 text-xl font-semibold"
            {...p}
        />
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
    // Build the table of contents from the H2 headings, with slugs that match
    // rehype-slug (github-slugger) so the anchor links line up.
    const toc = useMemo(() => {
        const slugger = new GithubSlugger();
        return guideContent
            .split('\n')
            .filter((line) => /^##\s+/.test(line))
            .map((line) => {
                const title = line.replace(/^##\s+/, '').trim();
                return { title, id: slugger.slug(title) };
            });
    }, []);

    return (
        <>
            <Head title="User Guide — Kidney-Love" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <Link href={home()} className="flex items-center gap-2 font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <HeartPulse className="size-5" />
                        </span>
                        Kidney-Love
                    </Link>
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" /> Back home
                    </Link>
                </header>

                <div className="mx-auto max-w-6xl gap-10 px-6 pb-20 lg:flex">
                    {/* Table of contents */}
                    <aside className="mb-8 shrink-0 lg:sticky lg:top-6 lg:mb-0 lg:h-[calc(100vh-3rem)] lg:w-60 lg:overflow-y-auto">
                        <div className="rounded-lg border border-border p-4 lg:border-0 lg:p-0">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Contents
                            </div>
                            <nav className="flex flex-col gap-0.5">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="rounded px-2 py-1 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                    >
                                        {item.title}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="min-w-0 max-w-3xl scroll-smooth">
                        <Markdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSlug]}
                            components={components}
                        >
                            {guideContent}
                        </Markdown>
                    </main>
                </div>
            </div>
        </>
    );
}
