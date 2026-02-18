"use client";

import Link from "next/link";
import { CampaignDoc, isDmOnlyDoc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";
import { parseBlocks, renderBlocks } from "@/lib/textBlocks";



export default function DocViewer({
  doc,
  backHref = "/docs",
  backLabel = "Back to DM tools",
  showBackLink = true,
}: {
  doc: CampaignDoc;
  backHref?: string;
  backLabel?: string;
  showBackLink?: boolean;
}) {
  const { dmMode } = useDmMode();
  const dmOnly = isDmOnlyDoc(doc);
  const titleHidden = dmOnly && !dmMode;

  // Content is locked if DM-only and you’re not in DM mode.
  const contentLocked = dmOnly && !dmMode;

  const title = titleHidden ? "Unknown Entry" : doc.title;

  const metaLine = [doc.act, doc.category, !titleHidden ? doc.path : null].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {metaLine ? <div className="text-sm text-black/60 dark:text-white/60">{metaLine}</div> : null}

          {dmOnly ? (
            <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
              DM-only
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {!dmOnly ? (
          <div className="inline-flex w-fit rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
            Player-safe
          </div>
        ) : null}
      </header>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        {contentLocked ? (
          <div className="space-y-3">
            <div className="text-base font-semibold">Locked</div>
            <div className="text-sm text-black/70 dark:text-white/70">
              This entry is DM-only.
            </div>
            <div className="text-sm text-black/60 dark:text-white/60">
              DM: toggle DM Mode in the navbar to view this document.
            </div>
          </div>
        ) : (
          <div className="prose max-w-none text-black dark:text-white">
            {renderBlocks(parseBlocks(doc.content))}
          </div>
        )}
      </div>

      {showBackLink ? (
        <div>
          <Link href={backHref} className="text-sm text-black/70 hover:underline dark:text-white/70">
            ← {backLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
