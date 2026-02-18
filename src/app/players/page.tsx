import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import PartyCard from "@/components/PartyCard";

export default function PlayersPage() {
  const campaign = getCampaign();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">The party roster and core roles.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaign.party.map((m) => (
          <PartyCard key={m.name} member={m} />
        ))}
      </div>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
