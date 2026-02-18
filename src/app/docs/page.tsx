"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCampaign, isSessionDoc } from "@/lib/campaign";
import DocsGrid from "@/components/DocsGrid";
import { useDmMode } from "@/components/DmModeProvider";

export default function DocsPage() {
  const campaign = useMemo(() => getCampaign(), []);
  const { dmMode } = useDmMode();
  const router = useRouter();

  useEffect(() => {
    if (!dmMode) router.replace("/");
  }, [dmMode, router]);

  if (!dmMode) return null;

  const dmTools = campaign.documents.filter((d) => !isSessionDoc(d));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">DM Tools</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Internal guides, encounters, relics, and campaign references. Not visible to players.
        </p>
      </header>

      <DocsGrid docs={dmTools} />
    </div>
  );
}
