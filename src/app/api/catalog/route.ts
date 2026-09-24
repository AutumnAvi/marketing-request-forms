import { NextResponse } from "next/server";
import { listPublishedSections } from "@/lib/catalog/store";

export const dynamic = "force-dynamic";

/** Public read: visible sections with their active forms, as the hub shows them. */
export async function GET() {
  return NextResponse.json({ sections: await listPublishedSections() });
}
