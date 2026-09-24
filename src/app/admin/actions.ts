"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  grantAdminSession,
  isAdminSession,
  isGateEnabled,
  passphraseMatches,
  revokeAdminSession,
} from "@/lib/admin-gate";
import {
  createForm,
  createSection,
  deleteForm,
  deleteSection,
  updateForm,
  updateSection,
} from "@/lib/catalog/store";
import {
  NotFoundError,
  ValidationError,
  parseFormInput,
  parseFormPatch,
  parseSectionInput,
  parseSectionPatch,
} from "@/lib/catalog/validate";

import type { ActionState } from "./action-state";

function formValues(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

/** Turns FormData into the loose record the validators expect. Checkbox
 *  fields are only present when ticked, so absent ones become "false". */
function payload(fd: FormData, booleans: string[]): Record<string, unknown> {
  const raw: Record<string, unknown> = formValues(fd);
  for (const key of booleans) raw[key] = fd.has(key) ? fd.get(key) : "false";
  return raw;
}

function failure(err: unknown, fd: FormData): ActionState {
  if (err instanceof ValidationError) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: err.fieldErrors, values: formValues(fd) };
  }
  if (err instanceof NotFoundError) {
    return { ok: false, message: err.message, values: formValues(fd) };
  }
  console.error(err);
  return { ok: false, message: "Could not save. Check the server log.", values: formValues(fd) };
}

async function assertAdmin(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Admin gate required");
}

function refreshCatalogViews(): void {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------- gate

export async function signInAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isGateEnabled()) redirect("/admin");
  const passphrase = String(fd.get("passphrase") ?? "");
  if (!passphraseMatches(passphrase)) {
    return { ok: false, message: "That passphrase didn’t match.", fieldErrors: { passphrase: "Incorrect passphrase" } };
  }
  await grantAdminSession();
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  await revokeAdminSession();
  redirect("/admin");
}

// --------------------------------------------------------------- sections

export async function createSectionAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  try {
    await createSection(parseSectionInput(payload(fd, ["visible"])));
  } catch (err) {
    return failure(err, fd);
  }
  refreshCatalogViews();
  redirect("/admin?flash=section-created");
}

export async function updateSectionAction(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  try {
    await updateSection(id, parseSectionPatch(payload(fd, ["visible"])));
  } catch (err) {
    return failure(err, fd);
  }
  refreshCatalogViews();
  redirect("/admin?flash=section-saved");
}

export async function deleteSectionAction(id: string): Promise<void> {
  await assertAdmin();
  await deleteSection(id);
  refreshCatalogViews();
  redirect("/admin?flash=section-deleted");
}

export async function toggleSectionVisibilityAction(id: string, visible: boolean): Promise<void> {
  await assertAdmin();
  await updateSection(id, { visible });
  refreshCatalogViews();
}

// ------------------------------------------------------------------ forms

export async function createFormAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  try {
    await createForm(parseFormInput(payload(fd, ["active"])));
  } catch (err) {
    return failure(err, fd);
  }
  refreshCatalogViews();
  redirect("/admin?flash=form-created");
}

export async function updateFormAction(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  try {
    await updateForm(id, parseFormPatch(payload(fd, ["active"])));
  } catch (err) {
    return failure(err, fd);
  }
  refreshCatalogViews();
  redirect("/admin?flash=form-saved");
}

export async function deleteFormAction(id: string): Promise<void> {
  await assertAdmin();
  await deleteForm(id);
  refreshCatalogViews();
  redirect("/admin?flash=form-deleted");
}

export async function toggleFormActiveAction(id: string, active: boolean): Promise<void> {
  await assertAdmin();
  await updateForm(id, { active });
  refreshCatalogViews();
}
