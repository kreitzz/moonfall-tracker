import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const SHEETS_DIR = path.join(process.cwd(), "src", "data", "party-sheets");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_PARTY_SHEETS_TABLE ?? "party_sheets";

function safeSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function filePathFor(slug: string): string {
  return path.join(SHEETS_DIR, `${safeSlug(slug)}.json`);
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function getSupabaseSheet(slug: string) {
  const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?slug=eq.${encodeURIComponent(safeSlug(slug))}&select=data&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Supabase GET failed: ${res.status}`);
  }

  const rows = (await res.json()) as Array<{ data: unknown }>;
  return rows[0]?.data ?? null;
}

async function putSupabaseSheet(slug: string, data: unknown) {
  const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      slug: safeSlug(slug),
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Supabase PUT failed: ${res.status}`);
  }
}

export async function GET(_: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    if (hasSupabaseConfig()) {
      const data = await getSupabaseSheet(slug);
      return NextResponse.json({ ok: true, data, source: "supabase" });
    }
  } catch {
    // fall through to local file fallback
  }

  const filePath = filePathFor(slug);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json({ ok: true, data, source: "file" });
  } catch {
    return NextResponse.json({ ok: true, data: null, source: hasSupabaseConfig() ? "supabase" : "file" });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const body = await req.json();
    if (hasSupabaseConfig()) {
      await putSupabaseSheet(slug, body);
      return NextResponse.json({ ok: true, source: "supabase" });
    }

    const filePath = filePathFor(slug);
    await fs.mkdir(SHEETS_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true, source: "file" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to save sheet." },
      { status: 500 }
    );
  }
}
