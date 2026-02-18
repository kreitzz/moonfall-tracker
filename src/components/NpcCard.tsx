"use client";

import Link from "next/link";
import Image from "next/image";
import { CampaignNpc } from "@/lib/campaign";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function NpcCard({ npc }: { npc: CampaignNpc }) {
  const title = npc.name;
  const blurb = npc.summary;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
            {npc.image ? (
              <Image src={npc.image} alt={npc.name} fill className="object-cover" sizes="48px" unoptimized />
            ) : null}
          </div>
          <div>
            <div className="text-sm text-black/60 dark:text-white/60">NPC</div>
            <div className="mt-0.5 text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-xs text-black/60 dark:text-white/60">
              {npc.title} · {npc.status}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 line-clamp-3 text-sm text-black/70 dark:text-white/70">{blurb}</div>

      <div className="mt-4">
        <Link
          href={`/npcs/${npc.id}`}
          className={classNames(
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
            "border-black/10 text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          )}
        >
          Open
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
