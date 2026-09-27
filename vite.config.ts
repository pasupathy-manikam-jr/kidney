import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

/**
 * Serves the app from a subfolder (staging runs it at /kidney-love). Pages and the
 * Wayfinder routes use root-relative literals like '/login' and '/sw.js', so they
 * need the folder in front. Set APP_PATH_PREFIX at build time
 * (APP_PATH_PREFIX=kidney-love npm run build); unset, this does nothing.
 *
 * ponytail: rewrites every string literal in resources/js starting with "/" plus a
 * letter. If a non-URL string ever starts that way, switch it to a Wayfinder route.
 */
function basePath(): Plugin {
    const prefix = (process.env.APP_PATH_PREFIX ?? '').replace(/^\/|\/$/g, '');

    return {
        name: 'kidney:base-path',
        enforce: 'pre',
        // Lazy-loaded chunks are fetched from here; the Laravel plugin would otherwise
        // derive it from ASSET_URL, which the CI build doesn't have.
        config: () => (prefix === '' ? {} : { base: `/${prefix}/build/` }),
        transform(code, id) {
            if (prefix === '' || !/resources[\\/]js[\\/].*\.tsx?$/.test(id)) {
                return null;
            }

            // The lookahead keeps an already prefixed URL from gaining a second.
            // The bare root is only rewritten as a Wayfinder `url: '/'`, since a
            // plain '/' is also a path separator (e.g. base64 decoding).
            return code
                .replace(
                    new RegExp(`(['"\`])/(?!${prefix}[/'"\`?])(?=[a-z])`, 'g'),
                    `$1/${prefix}/`,
                )
                .replace(/(\burl: )'\/'/g, `$1'/${prefix}'`);
        },
    };
}

export default defineConfig({
    plugins: [
        basePath(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
