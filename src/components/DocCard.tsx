"use client";

import Link from "next/link";
import { CampaignDoc, isDmOnlyDoc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function DocCard({ doc }: { doc: CampaignDoc }) {
  const { dmMode } = useDmMode();
  const dmOnly = isDmOnlyDoc(doc);
  const locked = dmOnly ? !dmMode : false;

  const title = locked ? "Unknown Entry" : doc.title;

  const blurb = dmOnly ? (dmMode ? doc.content : "Locked (DM guide).") : doc.content;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-black/60 dark:text-white/60">
            {doc.act} · {doc.category}
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          {dmOnly ? (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
              DM
            </span>
          ) : (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              Player
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 line-clamp-3 text-sm text-black/70 dark:text-white/70">{blurb}</div>

      <div className="mt-4">
        <Link
          href={`/docs/${doc.id}`}
          className={classNames(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
            locked
              ? "border-black/10 text-black/40 dark:border-white/10 dark:text-white/40"
              : "border-black/10 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          )}
          aria-disabled={locked}
          tabIndex={locked ? -1 : 0}
          onClick={(e) => {
            if (locked) e.preventDefault();
          }}
        >
          {locked ? "Locked" : "Open"}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
