# Marketing Request Forms — source of truth

Internal staff hub where people browse **sections** and open **Asana request forms** through Asana's official embed. A separate **admin** area lets Marketing Ops add and edit sections and forms at any time. Owner: Avi (Marketing Request Forms). This file is the product + architecture SoT; update it in the same commit as any change to the rules below.

## Product locks (do not reopen)

- Asana forms are rendered **only** via the official iframe embed (container + `https://form.asana.com/static/asana-form-embed-style.css`). Never rebuild a form as custom fields UI.
- Sections contain forms. Both are editable from admin.
- Admin ships **without real auth** — a placeholder passphrase gate (`ADMIN_GATE`) is acceptable for v1.
- The staff hub is public (no login).
- Seeded form: section **Creative** → **Creative Request Form** with embed src exactly
  `https://form.asana.com/?k=sA5VMfv_ii_J0XNFf9PawA&d=1218331939650540&embed=true`.
- Premium visual quality is a requirement, not polish: editorial serif + humanist sans, warm paper palette, one deep-green signal colour, restrained motion. No purple gradients, no checkerboards, no lorem.

Out of scope for this wave: creating/migrating Asana forms, real auth/SSO/allowlists, DAM/Zapier/custom form builders, live Supabase migrations.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript, React 19. `npm run build` must pass.
- Node ≥ 22.6 (the seed script uses Node's built-in type stripping).
- No UI framework; plain CSS with tokens in `src/app/globals.css` and CSS Modules per area.
- Fonts via `next/font/google`: Instrument Serif (display), Inter (UI), JetBrains Mono (labels/meta).
- Zero external DB in v1. Storage is a JSON file (see below).

## Domain

```ts
Section     { id, name, slug, description, order, visible, createdAt, updatedAt }
RequestForm { id, sectionId, title, slug, description, asanaEmbedUrl, order, active, createdAt, updatedAt }
Catalog     { version: 1, sections: Section[], forms: RequestForm[] }
```

- Slugs are auto-derived (`slugify`) and made unique per collection; they are the public URL keys.
- `order` is ascending, ties broken by `createdAt`. New items default to "last".
- Hub shows `visible` sections and `active` forms only. Hidden/inactive items 404 on the hub but stay in admin.
- Deleting a section deletes its forms. Forms whose section vanished are listed in admin as orphans.
- `asanaEmbedUrl` is validated: `https://form.asana.com/…` with `k` and `d` params; `embed=true` is enforced on save.

## Storage

`src/lib/catalog/store.ts` is the only module that touches disk.

- Default path `data/catalog.json` (committed, seeded). Override with `CATALOG_PATH`.
- On Vercel (`process.env.VERCEL`) the bundle is read-only, so the store uses `/tmp/marketing-request-forms/catalog.json`, initialised from the bundled `data/catalog.json`. Writes there are **ephemeral** (per instance, lost on redeploy). Admin shows a notice. Durable hosted persistence = the Supabase path in the README.
- Writes are atomic (temp file + rename) and serialised through an in-process queue.
- First read seeds the file if missing (`seedCatalog` in `seed.ts`). `npm run seed` does the same from the CLI; `--reset` overwrites.
- `next.config.ts` includes `data/**` in output file tracing so the seed ships in the serverless bundle.

## Routes

Staff hub (public, `dynamic = "force-dynamic"` so edits show immediately):

- `/` — hero, section index, section groups with form cards. Empty states invite adding the first section/form.
- `/sections/[slug]` — one section's forms.
- `/forms/[slug]` — form detail with `<AsanaEmbed>` + "Open in Asana" + sidebar. `AsanaEmbed` follows Asana's snippet exactly (`.asana-embed-container`, `.asana-embed-iframe`, `.asana-embed-footer` with the `.asana-embed-footer-logo` span whose image comes from Asana's stylesheet) and adds a fallback line linking to the form in Asana. Forms restricted in Asana to signed-in users render only for people with an Asana session; anonymous visitors get Asana's login redirect, which cannot be framed. That is an Asana form setting, not an app bug.

Admin (`/admin/**`, gated by `src/lib/admin-gate.ts`):

- `/admin` — overview: sections with nested form tables, show/hide + activate/deactivate toggles, flash messages.
- `/admin/sections/new`, `/admin/sections/[id]`, `/admin/forms/new`, `/admin/forms/[id]` — editors (client components using `useActionState` bound to server actions in `src/app/admin/actions.ts`).
- Mutations call `revalidatePath("/", "layout")` and redirect back to `/admin?flash=…`.

JSON API (`src/app/api/**`): `GET /api/catalog` (published view), `GET|POST /api/sections`, `GET|PATCH|DELETE /api/sections/[id]`, `GET|POST /api/forms`, `GET|PATCH|DELETE /api/forms/[id]`. Reads are public; writes go through `guarded()` (gate + error mapping → 400/401/404/500 JSON).

## Admin gate

- `ADMIN_GATE` unset → admin open, UI shows a warning notice.
- `ADMIN_GATE` set → `/admin` renders a passphrase form; success sets an HttpOnly cookie holding `HMAC(secret, "marketing-request-forms:admin")`, never the passphrase. API writes accept the same token via `x-admin-token`, or `Authorization: Bearer <ADMIN_GATE>`.
- Server actions call `assertAdmin()` independently of the layout check.

## Conventions

- Read before changing; make the smallest correct change; verify with real evidence (build output, screenshots).
- Keep accessible markup: labelled fields, `aria-invalid`/`aria-describedby`, skip link, `aria-current` in nav, visible focus rings.
- Copy is real product copy, never placeholder text.
- Do not add dependencies for things the platform already does (validation, fonts, icons are hand-rolled on purpose).
- `AGENTS.md` is generated by `next dev`; leave it in place.

## Later waves (not now)

- Real auth (SSO / allowlist) replacing the gate.
- Supabase `sections` / `forms` tables behind the same `store.ts` function signatures.
- Per-form analytics, search, request status surfacing.
