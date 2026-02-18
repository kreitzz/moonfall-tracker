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
            <span className="font-medium">DM Mode is enabled.</span> DM Tools and map reveals are now available.
          </div>
          <Link href="/admin" className="text-sm font-medium underline underline-offset-4">
            Open DM dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}
