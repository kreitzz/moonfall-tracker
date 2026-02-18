import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import BattleCard from "@/components/BattleCard";

export default function BattlesPage() {
  const campaign = getCampaign();
  const battles = [...(campaign.battles ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Encounters</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">Encounters, monsters, and moments worth remembering.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {battles.map((b) => (
          <BattleCard key={b.id} battle={b} />
        ))}
      </div>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
