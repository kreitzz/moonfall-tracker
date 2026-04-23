"use client";

import Image from "next/image";
import Link from "next/link";
import { CampaignBattle } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

export default function BattleViewer({ battle }: { battle: CampaignBattle }) {
  const { dmMode } = useDmMode();
  const locked = battle.dmOnly && !dmMode;

  if (locked) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <div className="text-sm text-black/60 dark:text-white/60">Encounter</div>
          <h1 className="text-2xl font-semibold tracking-tight">Unknown Entry</h1>
        </header>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-base font-semibold">Locked</div>
          <div className="mt-2 text-sm text-black/70 dark:text-white/70">This encounter entry is DM-only.</div>
          <div className="mt-6">
            <Link href="/battles" className="text-sm text-black/70 hover:underline dark:text-white/70">
              ← Back to Encounters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">Encounter</div>
        <h1 className="text-2xl font-semibold tracking-tight">{battle.name}</h1>
        <div className="text-black/70 dark:text-white/70">
          CR {battle.cr} · {battle.type}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="relative aspect-[4/5] min-h-[320px] overflow-hidden rounded-2xl">
            {battle.image ? <Image src={battle.image} alt={battle.name} fill className="object-cover" unoptimized /> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Summary</div>
          <div className="mt-2 text-black/70 dark:text-white/70">{battle.summary}</div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/battles"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              ← Back to Encounters
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
