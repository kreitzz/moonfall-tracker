const guilds = [
  {
    name: "Martial Concord",
    district: "Stadium Barracks",
    slotCount: 5,
    tone: "Disciplined duelists, clean victories, and controlled violence.",
    npc: "Captain Vael Rusk, duelmaster",
    learned: [
      "The Games are not just sport; guilds use them to scout useful outsiders.",
      "Concord champions are expected to win visibly and honorably.",
      "The Concord respects strength, but only if it comes with control.",
    ],
  },
  {
    name: "Civic Wardens",
    district: "Warden House and Backroom Pit",
    slotCount: 5,
    tone: "Official order up front, drunken brawling in the back.",
    npc: "Borrik Hale, off-duty Warden captain",
    learned: [
      "Mead found people who love brawling almost as much as he does.",
      "The Wardens handle crowd control during the Games.",
      "If trouble happens in Lunaryth, they usually know before the temples admit it.",
    ],
  },
  {
    name: "Scholar's Consortium",
    district: "Archive Steps",
    slotCount: 5,
    tone: "Records, citations, permissions, and exhausted intelligence.",
    npc: "Archivist Pellan Voss, senior cataloguer",
    learned: [
      "They care about information, accuracy, and not wasting time.",
      "The place feels more like a working archive than a grand hall.",
      "They seem polite until someone asks something obvious.",
    ],
  },
  {
    name: "Artisan Compact",
    district: "Forge Row and Arena Works",
    slotCount: 5,
    tone: "Engineers, smiths, arena wardwrights, and practical craft.",
    npc: "Master Ivara Quen, forgewright",
    learned: [
      "The Compact maintains arena mechanisms, sigils, barriers, and safety wards.",
      "Old Lunaryth stonework predates much of the current guild engineering.",
      "If something has a structure, the Compact believes it can fail.",
    ],
  },
  {
    name: "Lunar Synod",
    district: "Temple District",
    slotCount: 5,
    tone: "Polite, spiritual, procedural, and quietly dismissive.",
    npc: "Sister Maerith Solenne, temple liaison",
    learned: [
      "The Synod follows Selune.",
      "They are spiritual people who follow Selune.",
    ],
  },
  {
    name: "Mercantile League",
    district: "Counting House Promenade",
    slotCount: 7,
    tone: "Rich, cruelly polished, and openly convinced everyone else is beneath them.",
    npc: "Veyra Lint, patron-broker",
    learned: [
      "The League hoards many of the best items in Lunaryth.",
      "They have won the last six Guild Games.",
      "They treated the party like peasants and kicked them out.",
    ],
  },
];

const bracketPods = [
  ["Mercantile League", "Civic Wardens", "Scholar's Consortium", "Artisan Compact"],
  ["Mercantile League", "Martial Concord", "Lunar Synod", "Civic Wardens"],
  ["Mercantile League", "Scholar's Consortium", "Artisan Compact", "Martial Concord"],
  ["Mercantile League", "Lunar Synod", "Civic Wardens", "Scholar's Consortium"],
  ["Mercantile League", "Artisan Compact", "Martial Concord", "Lunar Synod"],
  ["Mercantile League", "Civic Wardens", "Scholar's Consortium", "Artisan Compact"],
  ["Mercantile League", "Martial Concord", "Lunar Synod", "Civic Wardens"],
  ["Martial Concord", "Scholar's Consortium", "Artisan Compact", "Lunar Synod"],
];

const guildStyles: Record<string, string> = {
  "Martial Concord": "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200",
  "Civic Wardens": "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  "Scholar's Consortium": "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  "Artisan Compact": "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  "Lunar Synod": "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  "Mercantile League": "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
};

function guildClass(name: string) {
  return guildStyles[name] ?? "border-black/10 bg-black/[0.03] text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70";
}

type BracketSlot = {
  seed: number;
  guild: string;
  label: string;
  pod: number;
};

function SlotRow({ slot }: { slot?: BracketSlot }) {
  if (!slot) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 bg-black/[0.02] px-3 py-2 text-sm text-black/35 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/35">
        TBD
      </div>
    );
  }

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm font-medium ${guildClass(slot.guild)}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-70">Seed {slot.seed}</div>
      <div>{slot.guild}</div>
    </div>
  );
}

function BracketMatch({
  title,
  slots,
  heightClass,
}: {
  title: string;
  slots: Array<BracketSlot | undefined>;
  heightClass: string;
}) {
  return (
    <div className={`relative flex ${heightClass} items-center`}>
      <div className="w-56 rounded-2xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">{title}</div>
        <div className="space-y-3">
          <SlotRow slot={slots[0]} />
          <SlotRow slot={slots[1]} />
        </div>
      </div>
      <div className="hidden h-px w-8 bg-black/20 dark:bg-white/20 md:block" aria-hidden />
    </div>
  );
}

export default function GuildGamesPage() {
  let seed = 0;
  const firstRound = bracketPods.flatMap((pod, podIndex) => {
    const slots = pod.map((guild) => {
      seed += 1;
      return {
        seed,
        guild,
        label: `${guild} Slot ${seed}`,
        pod: podIndex + 1,
      };
    });

    return [
      [slots[0], slots[1]],
      [slots[2], slots[3]],
    ];
  });
  const rounds = [
    { name: "Round of 32", matches: firstRound, heightClass: "h-40" },
    { name: "Round of 16", matches: Array.from({ length: 8 }, () => [undefined, undefined] as Array<undefined>), heightClass: "h-80" },
    { name: "Quarterfinals", matches: Array.from({ length: 4 }, () => [undefined, undefined] as Array<undefined>), heightClass: "h-[40rem]" },
    { name: "Semifinals", matches: Array.from({ length: 2 }, () => [undefined, undefined] as Array<undefined>), heightClass: "h-[80rem]" },
    { name: "Final", matches: Array.from({ length: 1 }, () => [undefined, undefined] as Array<undefined>), heightClass: "h-[160rem]" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Guild Games</h1>
        <p className="mt-1 max-w-3xl text-black/70 dark:text-white/70">
          Lunaryth's public path to money, reputation, and access. The Mercantile League gets seven entrants as last year's winner.
          Every other guild gets five.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Where The Guilds Are</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              First-pass public notes from the party's initial sweep through Lunaryth.
            </p>
          </div>
          <div className="rounded-full border border-black/10 px-3 py-1 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
            32 total entrants
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guilds.map((guild) => (
            <article key={guild.name} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{guild.name}</h3>
                  <div className="mt-1 text-sm text-black/60 dark:text-white/60">{guild.district}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${guildClass(guild.name)}`}>
                  {guild.slotCount} slots
                </span>
              </div>

              <div className="mt-3 text-sm text-black/70 dark:text-white/70">{guild.tone}</div>
              <div className="mt-3 text-sm">
                <span className="font-semibold">Known face:</span>{" "}
                <span className="text-black/70 dark:text-white/70">{guild.npc}</span>
              </div>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/70 dark:text-white/70">
                {guild.learned.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">32-Person Bracket</h2>
          <p className="mt-1 max-w-3xl text-sm text-black/60 dark:text-white/60">
            Seeding is spread by guild. No guild can face itself in round 1 or round 2 unless Lunaryth officials alter the bracket.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-black/10 bg-black/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex min-w-[1600px] items-stretch gap-0">
            {rounds.map((round) => (
              <div key={round.name} className="flex w-64 flex-col">
                <div className="sticky top-0 z-10 mb-3 rounded-2xl bg-black px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">
                  {round.name}
                </div>
                <div>
                  {round.matches.map((match, matchIndex) => (
                    <BracketMatch
                      key={`${round.name}-${matchIndex}`}
                      title={`Match ${matchIndex + 1}`}
                      slots={match}
                      heightClass={round.heightClass}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex w-64 flex-col">
              <div className="sticky top-0 z-10 mb-3 rounded-2xl bg-red-700 px-3 py-2 text-sm font-semibold text-white">
                Champion
              </div>
              <div className="flex h-[160rem] items-center">
                <div className="w-56 rounded-2xl border border-dashed border-black/15 bg-white p-4 text-center text-sm font-semibold text-black/40 shadow-sm dark:border-white/15 dark:bg-zinc-950 dark:text-white/40">
                  Winner TBD
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-black/[0.03] p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="font-semibold tracking-tight">Slot Math</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {guilds.map((guild) => (
                <div key={guild.name} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm dark:bg-zinc-950">
                  <span>{guild.name}</span>
                  <span className="font-semibold">{guild.slotCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-black/[0.03] p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="font-semibold tracking-tight">Seeding Logic</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-black/70 dark:text-white/70">
              <li>Mercantile receives two extra slots because it won last year.</li>
              <li>Each four-person pod contains four different guilds.</li>
              <li>That means guildmates cannot collide until at least the regional semifinal layer.</li>
              <li>The bracket is political, not random. Lunaryth wants competition without early guild civil wars.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
