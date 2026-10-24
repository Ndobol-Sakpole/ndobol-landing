# Ndobol Sesarengan — landing page

English · [Bahasa Indonesia](README.id.md)

Promotional website for Ndobol Sesarengan, a cooperative rafting game by team DeEs. It includes the character and raft catalog, a MON economy explainer, a press kit, and a playtest signup form.

The frontend is plain HTML, CSS, and JavaScript. Node renders the pages during the build. Vercel serves those files and runs the signup API separately. Indonesian is the default language; English lives under `/en`.

The game has its own repository: [ndobol-game](https://github.com/Ndobol-Sakpole/ndobol-game). This repository does not run multiplayer rooms or deploy smart contracts.

## Run locally

Install Node.js 24 LTS, then:

```sh
git clone https://github.com/Ndobol-Sakpole/ndobol-landing.git
cd ndobol-landing
npm ci
cp .env.example .env
npm run dev
```

Open [localhost:4173](http://localhost:4173). On Windows, copy `.env.example` to `.env` using your editor or `Copy-Item .env.example .env`.

Without a database URL, local signups are saved in `storage/playtest.sqlite`. That file is ignored by Git. Nothing is emailed automatically.

## Deploy to Vercel

1. Import this repository into Vercel. Use the repository root and the **Other** framework preset. `vercel.json` sets `npm ci`, `npm run build`, and the `dist` output directory. Use Node.js **24.x**.
2. Create a Neon Postgres database, either through Vercel Marketplace or Neon. Use a separate database or branch for previews.
3. Copy the Neon connection string into `DATABASE_URL` in your local `.env`, then run `npm run db:migrate`. This creates the signup tables and keeps existing rows. Do this for each database you use.
4. Set `DATABASE_URL` in Vercel's environment variables. Optionally set `GAME_URL` to the deployed game and `SITE_URL` to the public website origin, such as `https://your-domain.example`.
5. Deploy. Open the home page, switch to English, submit a test signup, and cancel it with the code shown after submission.

If `DATABASE_URL` is missing or the migration has not run, the website still loads but the form returns an error. It will not claim to have saved a signup. SQLite is for local development; the Vercel functions never use it.

The play buttons open the [official demo](https://ndobol-game-teal.vercel.app/apps/web/index.html) by default. Set `GAME_URL` only when you want to use another deployment. The self-host guide remains available separately. Public settings are read at build time, so redeploy after changing them.

More detail: [deployment and operations](docs/deployment.md). Vercel setup follows its [Node runtime](https://vercel.com/docs/functions/runtimes/node-js) and [project configuration](https://vercel.com/docs/project-configuration/vercel-json) documentation.

## Configuration

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string. Required for signup on Vercel. Server only. |
| `GAME_URL` | Public HTTP(S) URL of the game. Optional. |
| `SITE_URL` | Public website origin for canonical URLs, social previews, and the sitemap. Optional before launch. |
| `PLAYTEST_DATABASE_PATH` | Local SQLite location; defaults to `storage/playtest.sqlite`. |
| `PORT`, `HOST` | Local server; defaults to `4173` and `127.0.0.1`. |

Keep credentials in `.env` locally and Vercel environment variables in production. Never put them in `frontend/` or commit them.

## Where things live

```text
frontend/        Page templates, CSS, browser interactions, translations, assets
backend/         Rendering, validation, local HTTP server
api/             Vercel function entry points
data/            Catalog, public settings, database adapters, SQL migrations
shared/game/     Small snapshot of game pricing and reward rules
infra/           Static build and database migration scripts
tests/           Routes, translations, signup, storage, and reward checks
```

- Copy and links: `data/site.js`, `data/promotion.js`, `frontend/pages/`.
- Artwork and styling: `frontend/assets/`, `frontend/styles/`. Hero and footer layouts are separate.
- English translations: `frontend/locales/`. Indonesian text is the lookup key.
- Raft prices: `shared/game/rafts.js`, stored as integer wei strings, displayed as MON. See [the source notes](shared/game/README.md) before updating.
- Economy explanation and proposed allocations: `data/economy.js`. Displaying a price does not enable purchases or claims.

The impact panel has no production data source yet. Unavailable totals stay unavailable; in-game litter is not presented as measured physical waste or verified carbon credits.

## Checks and build

```sh
npm test
npm run build
```

Tests cover both languages, resource links, private-file access, signup validation, duplicates, cancellation, storage failures, and PostgreSQL queries. The Postgres tests use PGlite locally and do not need credentials. They do not replace a live Neon/Vercel smoke test.

`dist/` contains the static website. Uploading only that folder to a static host will not run the signup API. Vercel deploys the root `api/` functions alongside it.

An optional GitHub Actions workflow is provided at `infra/ci/github-actions.yml`. It is a template, not an active workflow. To enable it, add its contents as `.github/workflows/ci.yml` in GitHub's web editor, or push it using credentials with workflow access. It runs the tests and build without deployment secrets.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) for small changes and [SECURITY.md](SECURITY.md) for private reports. Please keep signup data, credentials, local databases, and build output out of commits.

Code and documentation are [MIT licensed](LICENSE). Fonts retain their own licenses. Project artwork and branding have separate terms in [ASSETS.md](ASSETS.md); MIT does not automatically license those visuals. See [third-party notices](THIRD_PARTY_NOTICES.md).

Created by Ndobol Sesarengan - Monad Blitz Hackathon team DeEs.
