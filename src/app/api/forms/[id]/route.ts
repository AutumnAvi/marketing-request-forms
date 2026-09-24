import { NextResponse } from "next/server";
import { guarded, readJsonBody } from "@/lib/api";
import { deleteForm, getFormById, updateForm } from "@/lib/catalog/store";
import { parseFormPatch } from "@/lib/catalog/validate";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const form = await getFormById((await params).id);
  if (!form) return NextResponse.json({ error: "not_found", message: "Form not found" }, { status: 404 });
  return NextResponse.json({ form });
}

export const PATCH = guarded<Context>(async (request, { params }) => {
  const patch = parseFormPatch(await readJsonBody(request));
  const form = await updateForm((await params).id, patch);
  return NextResponse.json({ form });
});

export const DELETE = guarded<Context>(async (_request, { params }) => {
  await deleteForm((await params).id);
  return NextResponse.json({ ok: true });
});
