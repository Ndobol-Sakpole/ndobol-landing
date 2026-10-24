# Contributing

Run Node.js 24, `npm ci`, and `npm run dev`. Keep a change focused: describe what was broken or missing, what changed, and how you checked it.

Before opening a pull request, run `npm test` and `npm run build`. For visible changes, check desktop and mobile, both languages, and keyboard navigation. Screenshots help when changing layout.

Keep browser code in `frontend/`, HTTP and validation code in `backend/`, and database code in `data/`. The files under `api/` should remain small adapters. This project uses vanilla JavaScript; avoid adding a frontend framework for a small feature.

Indonesian is the source language. Update the English dictionary when changing public copy. Keep HTML input values, lookup IDs, URLs, and executable code out of translation keys.

Do not submit credentials, signup data, local databases, generated build output, or assets without a known source and license. See [ASSETS.md](ASSETS.md) for artwork terms. Report security issues privately using [SECURITY.md](SECURITY.md).

Contributions to code and documentation are submitted under the project's MIT license. Tell us separately about any third-party material included in your change.
