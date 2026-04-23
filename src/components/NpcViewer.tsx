"use client";

import Image from "next/image";
import Link from "next/link";
import { CampaignNpc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

export default function NpcViewer({ npc }: { npc: CampaignNpc }) {
  const { dmMode } = useDmMode();
  const locked = npc.dmOnly && !dmMode;

  if (locked) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="text-sm text-black/60 dark:text-white/60">NPC</div>
          <h1 className="text-2xl font-semibold tracking-tight">Unknown Entry</h1>
        </header>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-base font-semibold">Locked</div>
          <div className="mt-2 text-sm text-black/70 dark:text-white/70">This NPC entry is DM-only.</div>
          <div className="mt-6">
            <Link href="/npcs" className="text-sm text-black/70 hover:underline dark:text-white/70">
              ← Back to NPCs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">NPC</div>
        <h1 className="text-2xl font-semibold tracking-tight">{npc.name}</h1>
        <div className="text-black/70 dark:text-white/70">
          {npc.title} · {npc.status}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="relative aspect-[4/5] min-h-[320px] overflow-hidden rounded-2xl">
            {npc.image ? <Image src={npc.image} alt={npc.name} fill className="object-cover" unoptimized /> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Notes</div>
          <div className="mt-2 text-black/70 dark:text-white/70">{npc.summary}</div>

          {npc.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {npc.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-xs text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/npcs"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              ← Back to NPCs
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
