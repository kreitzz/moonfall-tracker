"use client";

import Link from "next/link";
import { useDmMode } from "@/components/DmModeProvider";

export default function HomeDmHint() {
  const { dmMode } = useDmMode();

  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
      {dmMode ? (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-medium">DM Mode is enabled.</span> DM-only guides and encounter notes will show up across the Codex.
          </div>
          <Link href="/admin" className="text-sm font-medium underline underline-offset-4">
            Open DM dashboard
          </Link>
        </div>
      ) : (
        <div>
          Players will only see public docs. If you’re the DM, toggle <span className="font-medium">DM Mode</span> in the navbar to unlock guides.
        </div>
      )}
    </div>
  );
}
