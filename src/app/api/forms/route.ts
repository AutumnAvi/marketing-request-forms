import { NextResponse } from "next/server";
import { guarded, readJsonBody } from "@/lib/api";
import { createForm, listForms } from "@/lib/catalog/store";
import { parseFormInput } from "@/lib/catalog/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ forms: await listForms() });
}

export const POST = guarded(async (request) => {
  const input = parseFormInput(await readJsonBody(request));
  const form = await createForm(input);
  return NextResponse.json({ form }, { status: 201 });
});
