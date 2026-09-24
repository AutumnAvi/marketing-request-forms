import { NextResponse } from "next/server";
import { guarded, readJsonBody } from "@/lib/api";
import { deleteSection, getSectionById, updateSection } from "@/lib/catalog/store";
import { parseSectionPatch } from "@/lib/catalog/validate";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const section = await getSectionById((await params).id);
  if (!section) return NextResponse.json({ error: "not_found", message: "Section not found" }, { status: 404 });
  return NextResponse.json({ section });
}

export const PATCH = guarded<Context>(async (request, { params }) => {
  const patch = parseSectionPatch(await readJsonBody(request));
  const section = await updateSection((await params).id, patch);
  return NextResponse.json({ section });
});

export const DELETE = guarded<Context>(async (_request, { params }) => {
  const result = await deleteSection((await params).id);
  return NextResponse.json({ ok: true, ...result });
});
