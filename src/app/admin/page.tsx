"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getCampaign, isDmOnlyDoc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";
import { useReveals } from "@/components/RevealProvider";

export default function AdminPage() {
  const campaign = useMemo(() => getCampaign(), []);
  const { dmMode } = useDmMode();
  const reveals = useReveals();

  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);

  if (!dmMode) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="text-xl font-semibold tracking-tight">DM Dashboard</div>
        <p className="mt-2 text-black/70 dark:text-white/70">Enable DM Mode to access this page.</p>
      </div>
    );
  }

  const dmDocs = campaign.documents.filter((d) => isDmOnlyDoc(d));
  const publicIds = reveals.listPublicIds();
  const exportCode = reveals.exportCode();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">DM Dashboard</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Reveal control is stored in your browser (no database yet). Use the share code to sync with players.
        </p>
      </header>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight">Reveal / Share</h2>
        <p className="mt-1 text-sm text-black/70 dark:text-white/70">
          When the party discovers a map, mark it <span className="font-medium">Public</span> on the map card. Then share
          the code below with players (they paste it here or we can later add a dedicated /sync page).
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium">Export code</div>
            <textarea
              readOnly
              value={exportCode}
              className="mt-2 h-28 w-full rounded-xl border border-black/10 bg-black/[0.03] p-3 font-mono text-xs text-black/80 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/80"
            />
            <div className="mt-2 text-xs text-black/60 dark:text-white/60">Currently public: {publicIds.length} items</div>
          </div>

          <div>
            <div className="text-sm font-medium">Import code</div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste a reveal code here…"
              className="mt-2 h-28 w-full rounded-xl border border-black/10 bg-white p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-zinc-950 dark:focus:ring-white/20"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const res = reveals.importCode(importText);
                  setImportMsg(res.ok ? "Imported!" : res.error ?? "Could not import.");
                }}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Import
              </button>
              {importMsg ? <div className="text-sm text-black/70 dark:text-white/70">{importMsg}</div> : null}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          If you want reveals to update for everyone automatically (no copy/paste), the next upgrade is a tiny backend (Supabase).
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">DM-only docs (quick index)</h2>
          <Link href="/docs" className="text-sm text-black/70 hover:underline dark:text-white/70">
            Browse DM tools →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {dmDocs.slice(0, 12).map((d) => (
            <Link
              key={d.id}
              href={`/docs/${d.id}`}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:bg-black/[0.03] dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-white/5"
            >
              <div className="text-sm text-black/60 dark:text-white/60">
                {d.act} · {d.category}
              </div>
              <div className="mt-1 font-semibold tracking-tight">{d.title}</div>
              <div className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">{d.content}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
