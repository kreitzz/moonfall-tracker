import { NextRequest, NextResponse } from "next/server";
import {
  NYX_AGENT_INSTRUCTIONS,
  type NyxAgentRequest,
  type NyxAgentResponse,
  type NyxMessage,
  type NyxMode,
} from "@/lib/nyx-agent";

export const runtime = "nodejs";

const MAX_FIELD = 4000;

function text(value: unknown, max = MAX_FIELD) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseRequest(value: unknown): NyxAgentRequest | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const mode: NyxMode = raw.mode === "combat" || raw.mode === "downtime" ? raw.mode : "conversation";
  const prompt = text(raw.prompt);
  if (!prompt) return null;

  const memories = Array.isArray(raw.memories)
    ? raw.memories.slice(-20).map((item) => text(item, 500)).filter(Boolean)
    : [];
  const history: NyxMessage[] = Array.isArray(raw.history)
    ? raw.history.slice(-12).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        const role = record.role === "nyx" ? "nyx" : "dm";
        const messageText = text(record.text, 1200);
        return messageText ? [{ role, text: messageText }] : [];
      })
    : [];
  const relationships = raw.relationships && typeof raw.relationships === "object"
    ? Object.fromEntries(
        Object.entries(raw.relationships as Record<string, unknown>)
          .slice(0, 8)
          .map(([name, value]) => [text(name, 50), text(value, 800)])
          .filter(([name]) => Boolean(name))
      )
    : {};

  return {
    mode,
    prompt,
    scene: text(raw.scene),
    privateDirection: text(raw.privateDirection, 2000),
    goal: text(raw.goal, 1000),
    hp: text(raw.hp, 100),
    spellSlots: text(raw.spellSlots, 300),
    conditions: text(raw.conditions, 500),
    relationships,
    memories,
    history,
  };
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload.output)) return "";
  return payload.output
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) return [];
      return content.flatMap((part) => {
        if (!part || typeof part !== "object") return [];
        const value = (part as Record<string, unknown>).text;
        return typeof value === "string" ? [value] : [];
      });
    })
    .join("\n");
}

function parseAgentResponse(raw: string): NyxAgentResponse {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      speech: text(parsed.speech, 1600),
      action: text(parsed.action, 1600),
      intent: text(parsed.intent, 1000),
      dmNote: text(parsed.dmNote, 1000),
      memorySuggestion: text(parsed.memorySuggestion, 500),
    };
  } catch {
    return { speech: text(cleaned, 2000), action: "", intent: "", dmNote: "", memorySuggestion: "" };
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Nyx Agent needs OPENAI_API_KEY configured on the server." }, { status: 503 });
  }

  const expectedCode = process.env.NYX_AGENT_ACCESS_CODE;
  if (process.env.NODE_ENV === "production" && !expectedCode) {
    return NextResponse.json(
      { error: "Set NYX_AGENT_ACCESS_CODE on the server before enabling Nyx Agent in production." },
      { status: 503 }
    );
  }
  if (expectedCode && request.headers.get("x-nyx-agent-code") !== expectedCode) {
    return NextResponse.json({ error: "Incorrect Nyx Agent access code." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const input = parseRequest(body);
  if (!input) return NextResponse.json({ error: "Tell Nyx what is happening first." }, { status: 400 });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 600,
      instructions: NYX_AGENT_INSTRUCTIONS,
      input: JSON.stringify(input),
    }),
  });

  const result = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const error = result.error && typeof result.error === "object" ? (result.error as Record<string, unknown>).message : null;
    return NextResponse.json({ error: text(error, 500) || "Nyx Agent could not respond." }, { status: response.status });
  }

  const output = extractOutputText(result);
  if (!output) return NextResponse.json({ error: "Nyx returned an empty response." }, { status: 502 });
  return NextResponse.json(parseAgentResponse(output));
}
