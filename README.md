# Marketing Request Forms

Internal staff hub for sending work to Marketing. Staff browse **sections** (Creative, Events, …) and open the right **Asana request form**, rendered with Asana's official embed. A separate **admin** area lets Marketing Ops add and edit sections and forms at any time — no deploy needed.

Built with Next.js 16 (App Router) + TypeScript. No database required in v1: the catalog is a JSON file with typed server helpers and a JSON API.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run build`     | Production build (`next build`).                                    |
| `npm start`         | Serve the production build.                                         |
| `npm run lint`      | ESLint (Next core-web-vitals + TypeScript rules).                   |
| `npm run typecheck` | `tsc --noEmit`.                                                     |
| `npm run seed`      | Write `data/catalog.json` if missing. `npm run seed -- --reset` overwrites with the pristine seed. |

Requires Node ≥ 22.6 (the seed script relies on Node's built-in TypeScript type stripping).

## Routes

| Route                       | Audience | Purpose                                                       |
| --------------------------- | -------- | ------------------------------------------------------------- |
| `/`                         | Staff    | Hub home: section index and form cards.                       |
| `/sections/[slug]`          | Staff    | One section's forms.                                          |
| `/forms/[slug]`             | Staff    | Form page with the live Asana embed.                          |
| `/admin`                    | Ops      | Overview: sections, nested forms, show/hide, activate toggles. |
| `/admin/sections/new`, `/admin/sections/[id]` | Ops | Create / edit / delete a section.               |
| `/admin/forms/new`, `/admin/forms/[id]`       | Ops | Create / edit / delete a form.                  |
| `/api/catalog`              | Public   | Published sections with active forms (JSON).                  |
| `/api/sections`, `/api/sections/[id]`, `/api/forms`, `/api/forms/[id]` | Public read, gated write | REST CRUD. |

## Environment

Copy `.env.example` to `.env.local`. Nothing is required to run.

| Variable       | Default                                                   | Purpose                                                                                                   |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ADMIN_GATE`   | _(unset — admin open, warning shown)_                     | Placeholder passphrase for `/admin`. Also authorises API writes via `x-admin-token` or `Authorization: Bearer <ADMIN_GATE>`. Not real auth; SSO comes later. |
| `CATALOG_PATH` | `./data/catalog.json` (Vercel: `/tmp/marketing-request-forms/catalog.json`) | Absolute path of the JSON catalog. Point it at a mounted volume for durable self-hosted storage. |

## Seed

`data/catalog.json` ships committed with one section and one form:

- Section **Creative**
- Form **Creative Request Form** — embed src exactly
  `https://form.asana.com/?k=sA5VMfv_ii_J0XNFf9PawA&d=1218331939650540&embed=true`

If the catalog file is missing on first request the app seeds it automatically from `src/lib/catalog/seed.ts`. `npm run seed -- --reset` restores it.

## Storage

The store (`src/lib/catalog/store.ts`) reads and writes a single JSON document. Writes are atomic and serialised, so admin edits persist across refreshes and restarts.

- **Local / self-hosted:** edits land in `data/catalog.json`. Commit the file if you want the catalog to travel with the repo.
- **Vercel:** the deployment filesystem is read-only, so the store works from `/tmp`, initialised from the committed `data/catalog.json`. Edits there are ephemeral (reset on redeploy or cold start) and admin shows a notice. To publish a change durably, edit `data/catalog.json` (or run the app locally and commit) and redeploy — or move to Supabase below.

### Supabase migration path (later wave — not implemented)

The store exposes plain async functions (`listSections`, `createForm`, …). Swapping the file for Postgres means re-implementing those functions against two tables and leaving every route untouched:

```sql
create table sections (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  "order" integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table forms (
  id text primary key,
  section_id text not null references sections(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  asana_embed_url text not null,
  "order" integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Reads for the hub would use the anon key with RLS `select` policies on `visible`/`active` rows; writes would go through the service role from server actions / route handlers only.

## Deploy to Vercel

1. Import the repo in Vercel; framework preset **Next.js** is auto-detected (`npm run build`).
2. Set `ADMIN_GATE` in Project → Settings → Environment Variables.
3. Deploy. `next.config.ts` includes `data/**` in output file tracing so the seeded catalog ships with the functions.

## Asana embed notes

- Forms are embedded with Asana's official pattern: `<link rel="stylesheet" href="https://form.asana.com/static/asana-form-embed-style.css">`, a `.asana-embed-container`, the `.asana-embed-iframe`, and the "Form powered by Asana" footer. See `src/components/AsanaEmbed.tsx`.
- Get an embed URL in Asana: open the form → **Share** → **Embed** → copy the iframe `src`. Admin validates it is `https://form.asana.com/…` with `k` and `d` parameters and forces `embed=true`.
- The iframe is 100 % wide with a 900 px minimum height (`clamp(900px, 85vh, 1400px)`), so long forms do not need a second scrollbar on most screens.
- Never rebuild an Asana form as custom fields UI — the iframe is the product.

## Project layout

```
data/catalog.json            seeded catalog (file store)
scripts/seed.mts             npm run seed
src/app/                     App Router routes (hub, admin, api)
src/app/admin/actions.ts     server actions for admin CRUD + gate
src/components/              hub, admin, AsanaEmbed, header/footer, icons
src/lib/catalog/             types, store, seed, slug, validate
src/lib/admin-gate.ts        placeholder passphrase gate
src/lib/api.ts               route-handler helpers (guard, errors)
CLAUDE.md                    product + architecture source of truth
```
