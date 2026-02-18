import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import NpcCard from "@/components/NpcCard";

export default function NpcsPage() {
  const campaign = getCampaign();
  const npcs = [...(campaign.npcs ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">NPCs</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">People you’ve met… and people you haven’t (yet).</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {npcs.map((n) => (
          <NpcCard key={n.id} npc={n} />
        ))}
      </div>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
