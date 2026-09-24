import type { FormInput, FormPatch, SectionInput, SectionPatch } from "./types";

export class ValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super(Object.values(fieldErrors).join("; ") || "Invalid input");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}

const ASANA_FORM_HOST = "form.asana.com";

/**
 * Accepts an Asana form share or embed URL and returns the canonical embed
 * `src` (https, form.asana.com, `embed=true`). Throws on anything else so the
 * hub never renders an iframe that points somewhere unexpected.
 */
export function normalizeAsanaEmbedUrl(raw: string): string {
  const value = raw.trim();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ValidationError({ asanaEmbedUrl: "Enter a full URL, e.g. https://form.asana.com/?k=…&d=…&embed=true" });
  }
  if (url.protocol !== "https:" || url.hostname !== ASANA_FORM_HOST) {
    throw new ValidationError({ asanaEmbedUrl: `URL must start with https://${ASANA_FORM_HOST}/` });
  }
  if (!url.searchParams.get("k") || !url.searchParams.get("d")) {
    throw new ValidationError({ asanaEmbedUrl: "Asana embed URLs include both a k= and a d= parameter" });
  }
  url.searchParams.set("embed", "true");
  return url.toString();
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function optionalBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "on" || v === "1") return true;
  if (v === "false" || v === "off" || v === "0" || v === "") return false;
  return fallback;
}

function optionalOrder(v: unknown, field: string, errors: Record<string, string>): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 9999) {
    errors[field] = "Order must be a whole number between 0 and 9999";
    return undefined;
  }
  return n;
}

export function parseSectionInput(raw: Record<string, unknown>): SectionInput {
  const errors: Record<string, string> = {};
  const name = str(raw.name);
  if (name.length < 2) errors.name = "Give the section a name (at least 2 characters)";
  if (name.length > 80) errors.name = "Keep the name under 80 characters";
  const description = str(raw.description);
  if (description.length > 280) errors.description = "Keep the description under 280 characters";
  const order = optionalOrder(raw.order, "order", errors);
  const slug = str(raw.slug) || undefined;
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { name, slug, description, order, visible: optionalBool(raw.visible, true) };
}

export function parseSectionPatch(raw: Record<string, unknown>): SectionPatch {
  const patch: SectionPatch = {};
  const errors: Record<string, string> = {};
  if ("name" in raw) {
    const name = str(raw.name);
    if (name.length < 2 || name.length > 80) errors.name = "Name must be 2–80 characters";
    patch.name = name;
  }
  if ("description" in raw) {
    const description = str(raw.description);
    if (description.length > 280) errors.description = "Keep the description under 280 characters";
    patch.description = description;
  }
  if ("slug" in raw) patch.slug = str(raw.slug) || undefined;
  if ("order" in raw) patch.order = optionalOrder(raw.order, "order", errors);
  if ("visible" in raw) patch.visible = optionalBool(raw.visible, true);
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return patch;
}

export function parseFormInput(raw: Record<string, unknown>): FormInput {
  const errors: Record<string, string> = {};
  const title = str(raw.title);
  if (title.length < 2) errors.title = "Give the form a title (at least 2 characters)";
  if (title.length > 120) errors.title = "Keep the title under 120 characters";
  const sectionId = str(raw.sectionId);
  if (!sectionId) errors.sectionId = "Choose a section";
  const description = str(raw.description);
  if (description.length > 280) errors.description = "Keep the description under 280 characters";
  const order = optionalOrder(raw.order, "order", errors);
  let asanaEmbedUrl = "";
  try {
    asanaEmbedUrl = normalizeAsanaEmbedUrl(str(raw.asanaEmbedUrl));
  } catch (e) {
    if (e instanceof ValidationError) Object.assign(errors, e.fieldErrors);
    else throw e;
  }
  const slug = str(raw.slug) || undefined;
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return { title, sectionId, slug, description, asanaEmbedUrl, order, active: optionalBool(raw.active, true) };
}

export function parseFormPatch(raw: Record<string, unknown>): FormPatch {
  const patch: FormPatch = {};
  const errors: Record<string, string> = {};
  if ("title" in raw) {
    const title = str(raw.title);
    if (title.length < 2 || title.length > 120) errors.title = "Title must be 2–120 characters";
    patch.title = title;
  }
  if ("sectionId" in raw) {
    const sectionId = str(raw.sectionId);
    if (!sectionId) errors.sectionId = "Choose a section";
    patch.sectionId = sectionId;
  }
  if ("description" in raw) {
    const description = str(raw.description);
    if (description.length > 280) errors.description = "Keep the description under 280 characters";
    patch.description = description;
  }
  if ("asanaEmbedUrl" in raw) {
    try {
      patch.asanaEmbedUrl = normalizeAsanaEmbedUrl(str(raw.asanaEmbedUrl));
    } catch (e) {
      if (e instanceof ValidationError) Object.assign(errors, e.fieldErrors);
      else throw e;
    }
  }
  if ("slug" in raw) patch.slug = str(raw.slug) || undefined;
  if ("order" in raw) patch.order = optionalOrder(raw.order, "order", errors);
  if ("active" in raw) patch.active = optionalBool(raw.active, true);
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return patch;
}
