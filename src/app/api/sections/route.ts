import { NextResponse } from "next/server";
import { guarded, readJsonBody } from "@/lib/api";
import { createSection, listSections } from "@/lib/catalog/store";
import { parseSectionInput } from "@/lib/catalog/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ sections: await listSections() });
}

export const POST = guarded(async (request) => {
  const input = parseSectionInput(await readJsonBody(request));
  const section = await createSection(input);
  return NextResponse.json({ section }, { status: 201 });
});
