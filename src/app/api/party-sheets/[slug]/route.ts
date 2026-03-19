import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const SHEETS_DIR = path.join(process.cwd(), "src", "data", "party-sheets");

function safeSlug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function filePathFor(slug: string): string {
  return path.join(SHEETS_DIR, `${safeSlug(slug)}.json`);
}

export async function GET(_: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const filePath = filePathFor(slug);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: null });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const filePath = filePathFor(slug);

  try {
    const body = await req.json();
    await fs.mkdir(SHEETS_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to save sheet." },
      { status: 500 }
    );
  }
}
