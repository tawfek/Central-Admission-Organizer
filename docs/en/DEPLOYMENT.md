# Deployment

## Environment

Create `.env` from `.env.example`:

```env
VITE_APP_URL=https://your-public-domain.example
```

This value is used in print/share output. Vite variables prefixed with `VITE_` are public browser values; never put secrets in them.

## Production build

```bash
bun install
bun run build
```

The build command extracts and validates the canonical `public/admission-minimums.pdf`, regenerates the JSON dataset and import report, then runs the Vite build.

Upload the `dist/` directory to any static host such as Cloudflare Pages, Netlify, Vercel static hosting, GitHub Pages (with appropriate base-path configuration), or a normal web server.

Because routing includes `/selection`, configure the host to fall back to `index.html` for client-side routes.
