import Link from "next/link";
import Image from "next/image";
import PartyCard from "@/components/PartyCard";
import NpcCard from "@/components/NpcCard";
import BattleCard from "@/components/BattleCard";
import ItemCard from "@/components/ItemCard";
import { getCampaign } from "@/lib/campaign";
import HomeDmHint from "@/components/HomeDmHint";
import PartyNameMark from "@/components/PartyNameMark";

export default function Home() {
  const campaign = getCampaign();
  const latestSession = [...(campaign.sessions ?? [])].sort((a, b) => (b.number ?? 0) - (a.number ?? 0))[0];
  const activePlayers = campaign.party.filter((member) => member.active !== false && (!member.guest || member.active));
  const publicNpcs = (campaign.npcs ?? []).filter((npc) => !npc.dmOnly);
  const publicBattles = (campaign.battles ?? []).filter((battle) => !battle.dmOnly);

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Next Session</h2>
        </div>
        <div className="mt-4 rounded-3xl border border-black/10 bg-white p-6 text-2xl font-semibold tracking-tight shadow-sm dark:border-white/10 dark:bg-zinc-950">
          Monday March 16
        </div>
      </section>

      <header className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="text-sm text-black/60 dark:text-white/60">Campaign tracker</div>
            <h1 className="mt-2">
              <PartyNameMark size="lg" />
            </h1>
            <p className="mt-2 text-base text-black/70 dark:text-white/70">
              A living, clickable record of the story so far — sessions, maps, lore, and character info.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/sessions"
                className="w-48 rounded-full bg-black px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                View sessions
              </Link>
              <Link
                href="/players"
                className="w-48 rounded-full border border-black/10 px-4 py-2 text-center text-sm font-medium text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
              >
                Players
              </Link>
              <Link
                href="/gallery"
                className="w-48 rounded-full border border-black/10 px-4 py-2 text-center text-sm font-medium text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
              >
                Open maps
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Party</div>
                <div className="mt-1 text-2xl font-semibold">{activePlayers.length}</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Active roster</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Sessions</div>
                <div className="mt-1 text-2xl font-semibold">{campaign.sessions?.length ?? 0}</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Logged so far</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">NPCs</div>
                <div className="mt-1 text-2xl font-semibold">{publicNpcs.length}</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Known characters</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Encounters</div>
                <div className="mt-1 text-2xl font-semibold">{publicBattles.length}</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Logged so far</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Key Items</div>
                <div className="mt-1 text-2xl font-semibold">{campaign.items?.length ?? 0}</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Worth tracking</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Party level</div>
                <div className="mt-1 text-2xl font-semibold">4</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Current average</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm text-black/60 dark:text-white/60">Deaths</div>
                <div className="mt-1 text-2xl font-semibold">2*</div>
                <div className="mt-1 text-sm text-black/70 dark:text-white/70">Kelsier, plus Aylin technically</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[420px] md:self-stretch">
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-hidden rounded-3xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
                <div className="relative h-full w-full">
                  <Image
                    src="/party/belligerentfive.png"
                    alt="The Belligerent Five"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute left-[9%] top-[21%] h-[25%] w-[21%]" aria-hidden>
                    <div className="absolute left-1/2 top-1/2 h-[130%] w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-600 shadow-lg shadow-black/30" />
                    <div className="absolute left-1/2 top-1/2 h-[130%] w-3.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-600 shadow-lg shadow-black/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <HomeDmHint />
      </header>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            <PartyNameMark />
          </h2>
          <Link href="/players" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all players →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activePlayers.map((m, idx) => (
            <PartyCard key={`${m.name}-${idx}`} member={m} />
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {publicNpcs.map((n) => (
            <NpcCard key={n.id} npc={n} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Key Items</h2>
          <Link href="/items" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all key items →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(campaign.items ?? []).slice(0, 3).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Guild Games</h2>
              <p className="mt-1 max-w-2xl text-sm text-black/70 dark:text-white/70">
                The party has reached Lunaryth, visited the guilds, and learned the Games are the city's cleanest path to coin,
                status, and access.
              </p>
            </div>
            <Link
              href="/guild-games"
              className="w-48 rounded-full bg-black px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              View bracket
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Encounters</h2>
          <Link href="/battles" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See all encounters →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicBattles.slice(0, 3).map((b) => (
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
        {latestSession ? (
          <div className="mt-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm text-black/60 dark:text-white/60">Session {latestSession.number}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{latestSession.title}</div>
            <p className="mt-2 max-w-3xl text-black/70 dark:text-white/70">{latestSession.summary}</p>
            {latestSession.mvp ? (
              <div className="mt-3 max-w-3xl text-pretty text-sm text-black/70 dark:text-white/70">
                <span className="font-semibold">MVP:</span> {latestSession.mvp.name} — {latestSession.mvp.reason}
              </div>
            ) : null}
            {latestSession.lowlight ? (
              <div className="mt-2 max-w-3xl text-pretty text-sm text-black/70 dark:text-white/70">
                <span className="font-semibold">Critical Fail:</span> {latestSession.lowlight.name} — {latestSession.lowlight.reason}
              </div>
            ) : null}
            <div className="mt-4">
              <Link
                href={`/sessions/${latestSession.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Open session <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-black/10 bg-black/[0.03] p-6 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            No sessions yet.
          </div>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">What We Know</h2>
          <Link href="/sessions" className="text-sm text-black/70 hover:underline dark:text-white/70">
            See sessions →
          </Link>
        </div>
        <div className="mt-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <ul className="list-disc space-y-2 pl-5 text-sm text-black/70 dark:text-white/70">
            {(campaign.meta.whatWeKnow ?? []).map((fact, idx) => (
              <li key={`fact-${idx}`}>{fact}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
