import Link from "next/link";
import PartyCard from "@/components/PartyCard";
import DocCard from "@/components/DocCard";
import NpcCard from "@/components/NpcCard";
import BattleCard from "@/components/BattleCard";
import { getCampaign } from "@/lib/campaign";
import HomeDmHint from "@/components/HomeDmHint";

export default function Home() {
  const campaign = getCampaign();
  const latestSession = [...campaign.sessions].sort((a, b) => (b.number ?? 0) - (a.number ?? 0))[0];

  // A few “featured” docs: player primer + act 1 location guides.
  const featured = campaign.documents
    .filter((d) => ["Session 0", "Moonfall Grotto", "Tide_s Rest", "The Lost Forest"].includes(d.title))
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-black/60 dark:text-white/60">Campaign tracker</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{campaign.meta.name}</h1>
            <p className="mt-2 max-w-2xl text-base text-black/70 dark:text-white/70">
              A living, clickable record of the story so far — sessions, maps, lore, and DM-only prep.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/sessions"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              View sessions
            </Link>
            <Link
              href="/docs"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              Browse codex
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              Open maps
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-black/60 dark:text-white/60">Party</div>
            <div className="mt-1 text-2xl font-semibold">{campaign.party.length}</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">Current roster</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-black/60 dark:text-white/60">Sessions</div>
            <div className="mt-1 text-2xl font-semibold">{campaign.sessions.length}</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">Logged so far</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm text-black/60 dark:text-white/60">Codex entries</div>
            <div className="mt-1 text-2xl font-semibold">{campaign.documents.length}</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">Guides + lore + encounters</div>
          </div>
        </div>

        <HomeDmHint />
      </header>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">The Belligerent Five</h2>
          <Link href="/docs" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all lore →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaign.party.map((m) => (
            <PartyCard key={m.name} member={m} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">NPCs</h2>
          <Link href="/npcs" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all NPCs →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(campaign.npcs ?? []).slice(0, 3).map((n) => (
            <NpcCard key={n.id} npc={n} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Battles</h2>
          <Link href="/battles" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all battles →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(campaign.battles ?? []).slice(0, 3).map((b) => (
            <BattleCard key={b.id} battle={b} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Latest logged session</h2>
          <Link href="/sessions" className="text-sm text-black/70 hover:underline dark:text-white/70">
            All sessions →
          </Link>
        </div>
        <div className="mt-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Session {latestSession.number}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{latestSession.title}</div>
          <p className="mt-2 max-w-3xl text-black/70 dark:text-white/70">{latestSession.summary}</p>
          <div className="mt-4">
            <Link
              href={`/docs/${latestSession.docId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Open session doc <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Featured entries</h2>
          <Link href="/docs" className="text-sm text-black/70 hover:underline dark:text-white/70">
            Browse codex →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {featured.map((d) => (
            <DocCard key={d.id} doc={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
