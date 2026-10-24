# Deployment and operations

## Vercel

Import this repository with the **Other** preset, root directory `.`, and Node.js **24.x**. The checked-in `vercel.json` provides the install/build commands, output directory, function timeout, clean URLs, and response headers. Do not add a catch-all SPA rewrite: these are separate HTML pages, and unknown URLs should return 404.

The build produces 18 pages across Indonesian and English, plus error pages, images, fonts, browser modules, and downloads. `/api/playtest` and `/api/playtest/cancel` run as Node functions. `/api/health` checks that the service responds; it does not check database connectivity.

Set these variables in Vercel, then redeploy:

- `DATABASE_URL`: a Neon Postgres connection string, used only by the server functions.
- `GAME_URL`: the playable game's public URL, when available. Otherwise the CTA goes to `/self-host`.
- `SITE_URL`: the production website origin for canonical links and sitemap generation. Do not point preview deployments at a preview URL you want indexed. Use Vercel's preview protection/no-index controls.

Use a separate Neon database or branch for preview deployments. Never expose production credentials to untrusted fork previews. No GitHub token or Vercel token is needed in the source code or CI workflow.

## Database setup

Create Neon Postgres through [Vercel Marketplace](https://vercel.com/marketplace) or [Neon](https://neon.com/). Get its connection string from the provider dashboard. The adapter uses the [Neon HTTP driver](https://neon.com/docs/serverless/serverless-driver), so a plain PostgreSQL server without Neon's HTTP endpoint is not a drop-in replacement.

Copy `.env.example` to `.env`, set `DATABASE_URL`, then run:

```sh
npm ci
npm run db:migrate
```

The script runs `data/migrations/001-playtest.sql` in a transaction. It is safe to rerun and does not erase registrations. Migrations are explicit: they are not run during a public request or every preview build. Future schema changes should get a new migration and a documented rollout plan.

The same connection string must be configured in Vercel. A missing database or missing tables produces a retryable 503 response, not a successful signup. There is no SQLite fallback in Vercel and no signup data is written into the deploy filesystem.

## Signup behavior

- Email is normalized and unique. Repeating an email does not overwrite the first registration.
- A successful new signup gets a random cancellation code, shown once. Only its SHA-256 hash is stored. An existing email gets no new code.
- The API accepts JSON, validates consent and device, limits the request body to 4 KiB, and rejects cross-site submissions.
- Production uses an atomic Postgres request counter: 10 requests per network address in 15 minutes, shared across function instances. The address is HMAC-hashed; the database stores the hash and expiration, not the raw address. Expired counters are deleted on subsequent requests. Local SQLite development uses an in-memory limiter.
- Vercel's forwarded address is trusted only in the Vercel runtime. For a self-hosted Node server behind a proxy, configure rate limits at the proxy; the app otherwise sees the proxy's address.
- There is no public subscriber-list API. There is no automatic email sender or confirmed-slot system.

Use the Neon dashboard or a restricted database client for operations. Limit access to the people running the playtest. Delete registrations after the program ends, as described in the privacy page. Database-provider backups can retain deleted rows according to the provider's retention policy.

## Check a deployment

1. Open `/`, `/en`, `/ekonomi`, and `/en/playtest` directly; refresh each page.
2. Check a character dialog, the language switch, hero/footer images, and a press-kit download.
3. Submit a test signup you control. Save its cancellation code, reload, and confirm the row exists in the provider dashboard.
4. Repeat the email. It should keep one row and issue no new cancellation code.
5. Cancel with the original code and confirm the row is gone. Do not put the code or email in an issue or screenshot.
6. Open a missing URL and confirm it returns HTTP 404.

## Static hosting and local Node

`npm run build` creates `dist/` for static hosts. They must support directory index files. The `_headers` file is provided for hosts that understand that format; Vercel uses `vercel.json` instead.

A static upload alone cannot save signups. Keep the API on the same origin or deploy the Node server with `npm start` and durable storage. Local Node uses SQLite unless `DATABASE_URL` is set. Back up that SQLite file if using it on a persistent server; never commit it.

## Prices and impact data

Raft prices and reward arithmetic are a versioned snapshot from the game. See `shared/game/README.md`. Prices are displayed in MON, with BigInt arithmetic for wei. The landing page does not connect a wallet or issue payments.

The deployed impact endpoint currently returns unavailable data. It does not export local development totals. Connect an audited aggregate game data source before showing production counts, and keep physical waste and carbon claims separate from game activity.

## Rollback

Use Vercel's previous deployment to roll back the website. Database changes do not roll back with deployments. The initial migration only creates tables; future destructive migrations need a separate backup and recovery plan.

## Optional GitHub Actions

`infra/ci/github-actions.yml` is an inactive workflow template. To enable it, create `.github/workflows/ci.yml` in GitHub's web editor and paste the template there. Alternatively, copy it locally and push with credentials that can write workflows. A classic PAT needs the `workflow` scope for that file. The website and Vercel build do not depend on GitHub Actions being enabled.
