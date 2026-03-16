"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Campaign } from "@/lib/campaign";
import { isDmOnlyDoc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";
import { useReveals } from "@/components/RevealProvider";

type Hit =
  | { kind: "doc"; id: string; title: string; subtitle: string; snippet: string; locked: boolean }
  | { kind: "session"; id: string; title: string; subtitle: string; href: string }
  | { kind: "map"; id: string; title: string; subtitle: string; href: string };

function mkSnippet(hay: string, q: string) {
  const idx = hay.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return hay.slice(0, 180);
  const start = Math.max(0, idx - 70);
  const end = Math.min(hay.length, idx + 110);
  return (start > 0 ? "…" : "") + hay.slice(start, end) + (end < hay.length ? "…" : "");
}

export default function GlobalSearch({ campaign }: { campaign: Campaign }) {
  const { dmMode } = useDmMode();
  const { isPublic } = useReveals();
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim();
    if (!query) return [];

    const results: Hit[] = [];

    for (const s of campaign.sessions) {
      const hay = `${s.title} ${s.summary}`;
      if (hay.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          kind: "session",
          id: s.id,
          title: s.title,
          subtitle: `Session ${s.number}`,
          href: `/sessions/${s.id}`,
        });
      }
    }

    if (dmMode) {
      for (const d of campaign.documents) {
        const locked = isDmOnlyDoc(d) && !dmMode;
        const content =
          typeof d.content === "string"
            ? d.content
            : Array.isArray(d.content)
              ? (d.content as string[]).join("\n")
              : String(d.content ?? "");
        const hay = `${d.title} ${d.path ?? ""} ${locked ? "" : content}`;
        if (hay.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            kind: "doc",
            id: d.id,
            title: d.title,
            subtitle: `${d.act} · ${d.category}${isDmOnlyDoc(d) ? " · DM" : ""}`,
            snippet: locked ? "Locked (enable DM Mode to search inside)." : mkSnippet(content, query),
            locked,
          });
        }
      }
    }

    for (const m of campaign.images) {
      if (!dmMode && !isPublic(m.id)) continue;
      const hay = `${m.title} ${m.path}`;
      if (hay.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          kind: "map",
          id: m.id,
          title: m.title,
          subtitle: `${m.act} · Map`,
          href: `/campaign/${m.path}`,
        });
      }
    }

    // Simple relevance-ish: title matches earlier -> higher.
    const score = (h: Hit) => {
      const title = h.title.toLowerCase();
      const qi = title.indexOf(query.toLowerCase());
      return qi === -1 ? 9999 : qi;
    };

    return results.sort((a, b) => score(a) - score(b)).slice(0, 50);
  }, [q, campaign, dmMode, isPublic]);

  return (
    <div className="space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the campaign…"
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-zinc-950 dark:focus:ring-white/20"
      />

      {q.trim() && hits.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          No matches yet.
        </div>
      ) : null}

      <div className="grid gap-3">
        {hits.map((h) => {
          if (h.kind === "doc") {
            return (
              <div key={`${h.kind}-${h.id}`} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-black/60 dark:text-white/60">{h.subtitle}</div>
                    <div className="mt-1 text-base font-semibold tracking-tight">{h.title}</div>
                  </div>
                  {h.locked ? (
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                      Locked
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-black/70 dark:text-white/70">{h.snippet}</div>
                <div className="mt-3">
                  <Link
                    href={`/docs/${h.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                  >
                    Open <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            );
          }

          if (h.kind === "session") {
            return (
              <div key={`${h.kind}-${h.id}`} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
                <div className="text-sm text-black/60 dark:text-white/60">{h.subtitle}</div>
                <div className="mt-1 text-base font-semibold tracking-tight">{h.title}</div>
                <div className="mt-3">
                  <Link href={h.href} className="text-sm font-medium underline underline-offset-4">
                    Open recap
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <div key={`${h.kind}-${h.id}`} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
              <div className="text-sm text-black/60 dark:text-white/60">{h.subtitle}</div>
              <div className="mt-1 text-base font-semibold tracking-tight">{h.title}</div>
              <div className="mt-3">
                <a href={h.href} target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4">
                  Open map
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
