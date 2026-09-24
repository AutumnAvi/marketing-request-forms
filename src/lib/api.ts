import "server-only";
import { NextResponse } from "next/server";
import { isAuthorizedRequest } from "@/lib/admin-gate";
import { NotFoundError, ValidationError } from "@/lib/catalog/validate";

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {
    // fall through
  }
  throw new ValidationError({ body: "Request body must be a JSON object" });
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: "validation", message: err.message, fieldErrors: err.fieldErrors }, { status: 400 });
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: "not_found", message: err.message }, { status: 404 });
  }
  console.error(err);
  return NextResponse.json({ error: "internal", message: "Something went wrong" }, { status: 500 });
}

/** Wraps a mutating handler with the admin gate + error mapping. */
export function guarded<TContext>(
  handler: (request: Request, context: TContext) => Promise<NextResponse>,
): (request: Request, context: TContext) => Promise<NextResponse> {
  return async (request, context) => {
    if (!(await isAuthorizedRequest(request))) {
      return NextResponse.json({ error: "unauthorized", message: "Admin gate required" }, { status: 401 });
    }
    try {
      return await handler(request, context);
    } catch (err) {
      return errorResponse(err);
    }
  };
}
