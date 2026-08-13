# KT OP 2025 — Kill Team Companion App

A mobile-first companion app for **Kill Team** (Games Workshop's skirmish miniatures game). It puts the rules sequence and the Crit/Tac Ops reference cards in your pocket during a game, and is installable as a PWA on Android for a distraction-free, full-screen experience at the table.

The UI content (rules, ops cards) is in Italian, matching the primary audience of this project.

**🔗 Live app:** https://arturobianchi.github.io/kt-op-2025/

## Current State

This is an actively evolving personal/hobby project. What's implemented today:

- **Regole (Rules)** — a swipeable carousel walking through the game sequence (prepare battle, select agents, deployment, playing the battle, end of battle), rendered from `src/properties/rules.json`.
- **Crit & Tac Ops** — a swipeable carousel of all Crit Op and Tac Op reference cards (mission actions, rule text, victory points), rendered from `src/properties/crit-tac-op.json` via typed models (`CritOp`/`TacOp`).
- **Battle** — placeholder screen (`WORK IN PROGRESS`); a scoreboard UI (my score / opponent score, +/- controls) is scaffolded but currently commented out while the underlying `battleSession` store is finalized.
- **Bottom navigation** between the three sections, plus a header with the app logo.
- **Persisted state** via Pinia, so the app remembers where you left off:
  - The **last-viewed carousel slide** is remembered per view (Rules vs. Crit/Tac Ops) and restored on the next visit, indefinitely (a UI preference, no expiry).
  - **Battle scores** are persisted with a *rolling 6-hour TTL*: they survive closing/reopening the app during an active match, but are automatically cleared 6 hours after the last interaction so old/abandoned sessions don't linger in `localStorage`.
  - An `filterOperations` store already exists (durable, non-expiring) to back an upcoming **search/filter feature** for the Crit/Tac Ops view — not wired to any UI yet.
- **Installable PWA** — a web app manifest + icon set let Chrome on Android install the app to the home screen and launch it full-screen (no address bar), see [`.requirements/PWA-REQUIREMENTS.md`](.requirements/PWA-REQUIREMENTS.md) for the full rationale.
- **Automatic deployment** to GitHub Pages on every push to `master` (see [Deployment](#deployment) below).

### Roadmap / not implemented yet

- Battle board scoreboard UI (score tracking) — store is ready, UI is commented out.
- Search/filter controls for the Crit & Tac Ops view (the `filterOperations` store is a placeholder for this).
- A future "battle session" tracking tool built on top of the persisted battle state.
- No automated test suite exists yet; validation is currently manual (dev server + build sanity checks).

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) + [Vite](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/) with `createWebHashHistory` (required for GitHub Pages, avoids 404s on refresh/deep links)
- [Pinia](https://pinia.vuejs.org/) + [`pinia-plugin-persistedstate`](https://prazdevs.github.io/pinia-plugin-persistedstate/) for persisted, `localStorage`-backed state
- [`@nuxt/ui`](https://ui.nuxt.com/) (used standalone via its Vite plugin, without the Nuxt framework) for the `UCarousel`/Embla-based carousel and other UI primitives
- [Tailwind CSS v4](https://tailwindcss.com/) for styling, alongside scoped component CSS
- [`sharp`](https://sharp.pixelplumbing.com/) (dev-only) to generate PWA icon PNGs from the SVG logo

## Project Structure

```
KT OP 2025/                        # git repository root
├── .github/workflows/deploy.yml   # CI: build + deploy to GitHub Pages on push to master
├── .junie/                        # Junie (AI assistant) guidelines and plans
├── .requirements/                 # Design/requirements notes (cards model, PWA installability, state migration)
└── vue-project/                   # the Vue application itself
    ├── public/                    # manifest.json, PWA icons, favicon, logo
    ├── scripts/
    │   └── generate-icons.mjs     # one-off script: renders PWA icons from public/logo.svg
    └── src/
        ├── assets/css/            # global styles / theme
        ├── components/
        │   ├── AppHeader.vue      # top logo/title bar
        │   ├── AppMenu.vue        # bottom navigation (Regole / Ops / Battle)
        │   ├── KTCarousel.vue     # shared carousel wrapper (Embla via @nuxt/ui), position-persisting
        │   └── cards/             # RuleCard, OpCard, CritCard, TacCard
        ├── models/CardModels.js   # BaseOp / CritOp / TacOp data models
        ├── properties/           # rules.json, crit-tac-op.json (game content)
        ├── router/index.js       # routes: / (Rules), /ops (CritTacOps), /battle (BattleBoard)
        ├── stores/
        │   ├── carousels.js       # last-viewed carousel slide per view (persisted, no expiry)
        │   ├── battleSession.js   # match scores (persisted, rolling 6h TTL)
        │   ├── filterOperations.js      # reserved for the future Crit/Tac Ops filter feature
        │   └── plugins/persistExpiry.js  # shared TTL serializer + boot-time cleanup sweep
        └── views/                 # Rules.vue, CritTacOps.vue, BattleBoard.vue, Sandbox.vue (dev-only)
```

## Getting Started

Requires Node.js `^22.18.0` or `>=24.12.0` (see `engines` in `vue-project/package.json`).

```bash
cd vue-project
npm install

npm run dev       # start the Vite dev server with hot reload
npm run build     # production build, output to vue-project/dist
npm run preview   # locally preview the production build
npm run icons     # regenerate PWA icons from public/logo.svg (only needed if the logo changes)
```

## Deployment

The app is automatically built and deployed to **GitHub Pages** by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `master` (or via manual dispatch):

1. `npm ci` + `npm run build` inside `vue-project/`.
2. The resulting `vue-project/dist` folder is uploaded and published through GitHub's official Pages Actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).

The live site is served at:

**https://arturobianchi.github.io/kt-op-2025/**

Two settings make this work correctly as a GitHub Pages *project* site (i.e. served from a `/kt-op-2025/` subpath rather than the domain root):

- `base: './'` in `vue-project/vite.config.js`, so built asset URLs are relative to the manifest/HTML location.
- `createWebHashHistory` in `vue-project/src/router/index.js`, so client-side routes (`#/ops`, `#/battle`) never require server-side rewrite rules and survive a hard refresh.

## Further Reading

- [`.junie/AGENTS.md`](.junie/AGENTS.md) — project guidelines followed when working on this codebase.
- [`.requirements/OP-REQUIREMENTS.md`](.requirements/OP-REQUIREMENTS.md) — data model design for Crit/Tac Op cards.
- [`.requirements/PWA-REQUIREMENTS.md`](.requirements/PWA-REQUIREMENTS.md) — PWA installability requirements and rationale.
- [`.junie/plans/`](.junie/plans/) — design docs for larger changes (e.g. the migration away from `KeepAlive` to persisted Pinia stores).
