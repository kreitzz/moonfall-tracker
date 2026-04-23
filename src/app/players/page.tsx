import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import PartyCard from "@/components/PartyCard";

export default function PlayersPage() {
  const campaign = getCampaign();
  const activePlayers = campaign.party.filter((member) => !member.guest || member.active);
  const inactivePlayers = campaign.party.filter((member) => member.guest && !member.active);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Players</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">The current party roster, guest PCs, and inactive bench.</p>
      </header>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Active PCs</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            Core party members plus guest PCs currently traveling with the group.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePlayers.map((m) => (
            <PartyCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      {inactivePlayers.length ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Inactive PCs</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              Guest PCs who are built and available, but were not present for the latest session.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inactivePlayers.map((m) => (
              <PartyCard key={m.name} member={m} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
