import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { seedCatalog } from "./seed";
import { slugify, uniqueSlug } from "./slug";
import type {
  Catalog,
  FormInput,
  FormPatch,
  RequestForm,
  Section,
  SectionInput,
  SectionPatch,
  SectionWithForms,
} from "./types";
import { NotFoundError, ValidationError } from "./validate";

/**
 * Where the catalog lives on disk.
 *
 * - Local / self-hosted: `data/catalog.json` in the repo (committed, seeded).
 * - `CATALOG_PATH`: any absolute path, e.g. a mounted volume.
 * - Vercel: the deployment bundle is read-only, so writes go to
 *   `/tmp/catalog.json` (ephemeral per instance — see README "Storage").
 */
export function resolveCatalogPath(): string {
  if (process.env.CATALOG_PATH) return path.resolve(process.env.CATALOG_PATH);
  if (process.env.VERCEL) return "/tmp/marketing-request-forms/catalog.json";
  return path.join(process.cwd(), "data", "catalog.json");
}

export function isEphemeralStorage(): boolean {
  return !process.env.CATALOG_PATH && Boolean(process.env.VERCEL);
}

const BUNDLED_CATALOG = path.join(process.cwd(), "data", "catalog.json");

function clone<T>(value: T): T {
  return structuredClone(value);
}

function now(): string {
  return new Date().toISOString();
}

function sortByOrder<T extends { order: number; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.version === 1 && Array.isArray(v.sections) && Array.isArray(v.forms);
}

async function writeAtomic(filePath: string, catalog: Catalog): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  await fs.rename(tmp, filePath);
}

async function readFileIfExists(filePath: string): Promise<Catalog | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isCatalog(parsed)) throw new Error(`Catalog at ${filePath} is malformed`);
    return parsed;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

/** Loads the catalog, seeding the store on first boot. */
export async function readCatalog(): Promise<Catalog> {
  const target = resolveCatalogPath();
  const existing = await readFileIfExists(target);
  if (existing) return existing;

  // On Vercel the working store starts from the catalog committed with the
  // deploy; everywhere else we fall back to the code seed.
  const initial =
    target !== BUNDLED_CATALOG ? (await readFileIfExists(BUNDLED_CATALOG)) ?? seedCatalog : seedCatalog;
  await writeAtomic(target, initial);
  return clone(initial);
}

// Mutations are serialised through a single promise chain so two concurrent
// admin writes cannot clobber each other.
let queue: Promise<unknown> = Promise.resolve();

async function mutate<T>(fn: (catalog: Catalog) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const catalog = await readCatalog();
    const result = await fn(catalog);
    await writeAtomic(resolveCatalogPath(), catalog);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listSections(): Promise<Section[]> {
  return sortByOrder((await readCatalog()).sections);
}

export async function listForms(): Promise<RequestForm[]> {
  return sortByOrder((await readCatalog()).forms);
}

export async function getSectionById(id: string): Promise<Section | undefined> {
  return (await readCatalog()).sections.find((s) => s.id === id);
}

export async function getSectionBySlug(slug: string): Promise<Section | undefined> {
  return (await readCatalog()).sections.find((s) => s.slug === slug);
}

export async function getFormById(id: string): Promise<RequestForm | undefined> {
  return (await readCatalog()).forms.find((f) => f.id === id);
}

export async function getFormBySlug(slug: string): Promise<RequestForm | undefined> {
  return (await readCatalog()).forms.find((f) => f.slug === slug);
}

/** Sections with their forms nested, ordered. Admin view: includes hidden/inactive. */
export async function listSectionsWithForms(): Promise<SectionWithForms[]> {
  const catalog = await readCatalog();
  return sortByOrder(catalog.sections).map((section) => ({
    ...section,
    forms: sortByOrder(catalog.forms.filter((f) => f.sectionId === section.id)),
  }));
}

/** Staff hub view: visible sections, active forms only. Empty sections are kept
 *  so staff can see a section exists even before it has forms. */
export async function listPublishedSections(): Promise<SectionWithForms[]> {
  const all = await listSectionsWithForms();
  return all
    .filter((s) => s.visible)
    .map((s) => ({ ...s, forms: s.forms.filter((f) => f.active) }));
}

/** Forms not attached to any existing section (e.g. after a bad import). */
export async function listOrphanForms(): Promise<RequestForm[]> {
  const catalog = await readCatalog();
  const ids = new Set(catalog.sections.map((s) => s.id));
  return sortByOrder(catalog.forms.filter((f) => !ids.has(f.sectionId)));
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function createSection(input: SectionInput): Promise<Section> {
  return mutate((catalog) => {
    const ts = now();
    const slug = uniqueSlug(
      slugify(input.slug ?? input.name),
      catalog.sections.map((s) => s.slug),
    );
    const order = input.order ?? Math.max(0, ...catalog.sections.map((s) => s.order)) + 1;
    const section: Section = {
      id: `sec_${randomUUID().slice(0, 8)}`,
      name: input.name,
      slug,
      description: input.description ?? "",
      order,
      visible: input.visible ?? true,
      createdAt: ts,
      updatedAt: ts,
    };
    catalog.sections.push(section);
    return clone(section);
  });
}

export async function updateSection(id: string, patch: SectionPatch): Promise<Section> {
  return mutate((catalog) => {
    const section = catalog.sections.find((s) => s.id === id);
    if (!section) throw new NotFoundError("Section");
    if (patch.name !== undefined) section.name = patch.name;
    if (patch.description !== undefined) section.description = patch.description;
    if (patch.order !== undefined) section.order = patch.order;
    if (patch.visible !== undefined) section.visible = patch.visible;
    if (patch.slug !== undefined) {
      const wanted = slugify(patch.slug);
      if (wanted !== section.slug) {
        section.slug = uniqueSlug(
          wanted,
          catalog.sections.filter((s) => s.id !== id).map((s) => s.slug),
        );
      }
    }
    section.updatedAt = now();
    return clone(section);
  });
}

/** Deletes a section and every form inside it. */
export async function deleteSection(id: string): Promise<{ deletedForms: number }> {
  return mutate((catalog) => {
    const idx = catalog.sections.findIndex((s) => s.id === id);
    if (idx === -1) throw new NotFoundError("Section");
    catalog.sections.splice(idx, 1);
    const before = catalog.forms.length;
    catalog.forms = catalog.forms.filter((f) => f.sectionId !== id);
    return { deletedForms: before - catalog.forms.length };
  });
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export async function createForm(input: FormInput): Promise<RequestForm> {
  return mutate((catalog) => {
    if (!catalog.sections.some((s) => s.id === input.sectionId)) {
      throw new ValidationError({ sectionId: "That section no longer exists" });
    }
    const ts = now();
    const slug = uniqueSlug(
      slugify(input.slug ?? input.title),
      catalog.forms.map((f) => f.slug),
    );
    const siblings = catalog.forms.filter((f) => f.sectionId === input.sectionId);
    const order = input.order ?? Math.max(0, ...siblings.map((f) => f.order)) + 1;
    const form: RequestForm = {
      id: `form_${randomUUID().slice(0, 8)}`,
      sectionId: input.sectionId,
      title: input.title,
      slug,
      description: input.description ?? "",
      asanaEmbedUrl: input.asanaEmbedUrl,
      order,
      active: input.active ?? true,
      createdAt: ts,
      updatedAt: ts,
    };
    catalog.forms.push(form);
    return clone(form);
  });
}

export async function updateForm(id: string, patch: FormPatch): Promise<RequestForm> {
  return mutate((catalog) => {
    const form = catalog.forms.find((f) => f.id === id);
    if (!form) throw new NotFoundError("Form");
    if (patch.sectionId !== undefined) {
      if (!catalog.sections.some((s) => s.id === patch.sectionId)) {
        throw new ValidationError({ sectionId: "That section no longer exists" });
      }
      form.sectionId = patch.sectionId;
    }
    if (patch.title !== undefined) form.title = patch.title;
    if (patch.description !== undefined) form.description = patch.description;
    if (patch.asanaEmbedUrl !== undefined) form.asanaEmbedUrl = patch.asanaEmbedUrl;
    if (patch.order !== undefined) form.order = patch.order;
    if (patch.active !== undefined) form.active = patch.active;
    if (patch.slug !== undefined) {
      const wanted = slugify(patch.slug);
      if (wanted !== form.slug) {
        form.slug = uniqueSlug(
          wanted,
          catalog.forms.filter((f) => f.id !== id).map((f) => f.slug),
        );
      }
    }
    form.updatedAt = now();
    return clone(form);
  });
}

export async function deleteForm(id: string): Promise<void> {
  return mutate((catalog) => {
    const idx = catalog.forms.findIndex((f) => f.id === id);
    if (idx === -1) throw new NotFoundError("Form");
    catalog.forms.splice(idx, 1);
  });
}
