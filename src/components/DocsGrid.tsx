"use client";

import { useMemo, useState } from "react";
import { CampaignDoc } from "@/lib/campaign";
import DocCard from "@/components/DocCard";

type Props = {
  docs: CampaignDoc[];
};

export default function DocsGrid({ docs }: Props) {
  const [q, setQ] = useState("");
  const [act, setAct] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const acts = Array.from(
    new Set(docs.map((d) => d.act).filter(Boolean))
  );
  
  const categories = useMemo(
    () => Array.from(new Set(docs.map((d) => d.category).filter((c): c is string => Boolean(c)))).sort(),
    [docs]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return docs
      .filter((d) => (act === "all" ? true : d.act === act))
      .filter((d) => (category === "all" ? true : d.category === category))
      .filter((d) => {
        if (!query) return true;
        const path = (d.path ?? "").toLowerCase();
        const content =
          typeof d.content === "string"
            ? d.content
            : Array.isArray(d.content)
              ? (d.content as string[]).join("\n")
              : String(d.content ?? "");
        return (
          d.title.toLowerCase().includes(query) ||
          path.includes(query) ||
          content.toLowerCase().includes(query)
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
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition " +
              (category === "all"
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/10 bg-white text-black hover:bg-black/[0.04] dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/10")
            }
          >
            All types
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={
                "rounded-full border px-3 py-1.5 text-sm transition " +
                (category === c
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/10 bg-white text-black hover:bg-black/[0.04] dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/10")
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="text-sm text-black/60 dark:text-white/60">
          Showing <span className="font-medium">{filtered.length}</span> tools.
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
