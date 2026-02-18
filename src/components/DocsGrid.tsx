"use client";

import { useMemo, useState } from "react";
import { CampaignDoc } from "@/lib/campaign";
import DocCard from "@/components/DocCard";
import { useDmMode } from "@/components/DmModeProvider";

type Props = {
  docs: CampaignDoc[];
};

export default function DocsGrid({ docs }: Props) {
  const { dmMode } = useDmMode();
  const [q, setQ] = useState("");
  const [act, setAct] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const acts = Array.from(
    new Set(docs.map((d) => d.act).filter(Boolean))
  );
  
  const categories = useMemo(() => Array.from(new Set(docs.map((d) => d.category))).sort(), [docs]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return docs
      .filter((d) => (act === "all" ? true : d.act === act))
      .filter((d) => (category === "all" ? true : d.category === category))
      .filter((d) => {
        if (!query) return true;
        return (
          d.title.toLowerCase().includes(query) ||
          d.path.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [docs, q, act, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles + content…"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-zinc-950 dark:focus:ring-white/20 md:w-72"
          />
          <select
            value={act}
            onChange={(e) => setAct(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
          >
            <option value="all">All acts</option>
            {acts.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
          >
            <option value="all">All types</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-black/60 dark:text-white/60">
          Showing <span className="font-medium">{filtered.length}</span> entries
          {dmMode ? " (including DM-only)." : "."}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((d) => (
          <DocCard key={d.id} doc={d} />
        ))}
      </div>
    </div>
  );
}
