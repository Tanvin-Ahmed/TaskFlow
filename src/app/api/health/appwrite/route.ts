import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT?.trim();
  const keyPresent = Boolean(process.env.NEXT_APPWRITE_KEY?.trim());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? null;

  if (!endpoint || !project) {
    return NextResponse.json(
      {
        ok: false,
        reason: "missing_env",
        endpoint: Boolean(endpoint),
        project: Boolean(project),
        keyPresent,
        appUrl,
        node: process.version,
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/locale`, {
      headers: {
        "X-Appwrite-Project": project,
      },
      cache: "no-store",
    });
    const body = await res.text();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      endpointHost: new URL(endpoint).host,
      keyPresent,
      appUrl,
      node: process.version,
      bodyPreview: body.slice(0, 120),
    });
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error
        ? {
            name: error.cause.name,
            message: error.cause.message,
            code:
              "code" in error.cause
                ? String((error.cause as { code?: unknown }).code)
                : undefined,
          }
        : undefined;

    return NextResponse.json(
      {
        ok: false,
        reason: "fetch_failed",
        endpointHost: (() => {
          try {
            return new URL(endpoint).host;
          } catch {
            return endpoint;
          }
        })(),
        keyPresent,
        appUrl,
        node: process.version,
        error: error instanceof Error ? error.message : String(error),
        cause,
      },
      { status: 500 },
    );
  }
}
