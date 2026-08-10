"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDmMode } from "@/components/DmModeProvider";

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

const bracketSeeds = [
  "Nyx Amberline",
  "Captain Elric Stone",
  "Amon Thrice-Marked",
  "Echo",
  "Sister Halwen",
  "Erynd Vale",
  "Lysa Marrow",
  "Kess Ironstep",
  "Pera Goldleaf",
  "Halvek Drumm",
  "Heywud",
  "Jorren Pike",
  "Tivan Roost",
  "Oren Solace",
  "Marra Vex",
  "Vaelin Tress",
  "Rilla Quen",
  "Ulric Mav",
  "Prom",
  "Mira Vell",
  "Corso Vane",
  "Tomas Rheel",
  "Ilyra Fen",
  "Dalia Forgehand",
  "Sable Marr",
  "Brannic Wex",
  "Sevrin Hale",
  "Mead",
  "Selka Arden",
  "Rovan Grell",
  "Corvin Pell",
  "Tharos Blackvein",
];

type BracketSlot = {
  seed: number;
  name: string;
  guild?: string;
  power?: string;
};

type BracketState = Array<Array<BracketSlot | undefined>>;

const BRACKET_STORAGE_KEY = "moonfall.guildGames.bracket.v1";

function emptyBracketState(): BracketState {
  return [
    Array.from({ length: 8 }, () => undefined),
    Array.from({ length: 4 }, () => undefined),
    Array.from({ length: 2 }, () => undefined),
    Array.from({ length: 1 }, () => undefined),
  ];
}

function hasBracketPicks(state: BracketState) {
  return state.some((round) => round.some(Boolean));
}

function isValidBracketSlot(value: unknown): value is BracketSlot {
  if (!value || typeof value !== "object") return false;
  const slot = value as Record<string, unknown>;
  return typeof slot.seed === "number" && typeof slot.name === "string";
}

function normalizeBracketState(value: unknown): BracketState | null {
  if (!Array.isArray(value) || value.length !== 4) return null;
  const expectedRoundLengths = [8, 4, 2, 1];
  const next = emptyBracketState();

  for (let roundIndex = 0; roundIndex < expectedRoundLengths.length; roundIndex++) {
    const round = value[roundIndex];
    if (!Array.isArray(round) || round.length !== expectedRoundLengths[roundIndex]) return null;
    next[roundIndex] = round.map((slot) => {
      if (slot == null) return undefined;
      return isValidBracketSlot(slot) ? slot : undefined;
    });
  }

  return next;
}

const entrantGuilds: Record<string, string> = {
  "Nyx Amberline": "Mercantile League",
  "Captain Elric Stone": "Civic Wardens",
  "Amon Thrice-Marked": "Scholar's Consortium",
  "Brakka Venn": "Artisan Compact",
  "Halvek Drumm": "Mercantile League",
  "Erynd Vale": "Martial Concord",
  "Lysa Marrow": "Lunar Synod",
  "Kess Ironstep": "Civic Wardens",
  "Pera Goldleaf": "Mercantile League",
  "Sister Halwen": "Scholar's Consortium",
  "Hest Quill": "Artisan Compact",
  "Jorren Pike": "Martial Concord",
  "Tivan Roost": "Mercantile League",
  "Oren Solace": "Lunar Synod",
  "Marra Vex": "Civic Wardens",
  "Vaelin Tress": "Scholar's Consortium",
  "Rilla Quen": "Mercantile League",
  "Ulric Mav": "Artisan Compact",
  "Tharos Blackvein": "Martial Concord",
  "Mira Vell": "Lunar Synod",
  "Corso Vane": "Mercantile League",
  "Tomas Rheel": "Civic Wardens",
  "Ilyra Fen": "Scholar's Consortium",
  "Echo": "Artisan Compact",
  "Sable Marr": "Mercantile League",
  "Prom": "Martial Concord",
  "Sevrin Hale": "Lunar Synod",
  "Rovan Grell": "Civic Wardens",
  "Selka Arden": "Martial Concord",
  "Heywud": "Scholar's Consortium",
  "Mead": "Civic Wardens",
  "Tahlia Rune": "Lunar Synod",
};

const entrantPower: Record<string, string> = {
  "Tharos Blackvein": "Boss",
  "Halvek Drumm": "Boss",
  "Nyx Amberline": "Boss",
  "Amon Thrice-Marked": "High",
  "Sister Halwen": "High",
  "Captain Elric Stone": "High",
  "Erynd Vale": "High",
  "Kess Ironstep": "High",
  "Mira Vell": "High",
  "Selka Arden": "High",
  "Oren Solace": "High",
  "Ilyra Fen": "High",
  "Pera Goldleaf": "Mid",
  "Jorren Pike": "Mid",
  "Prom": "Player",
  "Brakka Venn": "Mid",
  "Marra Vex": "Mid",
  "Rovan Grell": "Mid",
  "Tomas Rheel": "Mid",
  "Vaelin Tress": "Mid",
  "Hest Quill": "Mid",
  "Ulric Mav": "Mid",
  "Dalia Forgehand": "Mid",
  "Sevrin Hale": "Mid",
  "Rilla Quen": "Mid",
  "Sable Marr": "High",
  "Corvin Pell": "Mid",
  "Corso Vane": "Mid",
  "Tivan Roost": "Mid",
  "Lysa Marrow": "Mid",
  "Tahlia Rune": "Mid",
  "Neris Toll": "Mid",
  "Heywud": "Player",
  "Mead": "Player",
  "Echo": "Player",
};

const powerStyles: Record<string, string> = {
  Boss: "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  Mid: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  Low: "border-zinc-500/30 bg-zinc-500/10 text-zinc-800 dark:text-zinc-200",
  Player: "border-black/10 bg-black/[0.03] text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70",
  TBD: "border-black/10 bg-black/[0.03] text-black/55 dark:border-white/10 dark:bg-white/5 dark:text-white/55",
};

function powerClass(power?: string) {
  return powerStyles[power ?? "TBD"] ?? powerStyles.TBD;
}

function SlotRow({
  slot,
  selected,
  onClick,
}: {
  slot?: BracketSlot;
  selected?: boolean;
  onClick?: () => void;
}) {
  if (!slot) {
    return (
      <div className="min-h-[5.75rem] rounded-lg border border-dashed border-black/15 bg-black/[0.02] px-4 py-3 text-sm text-black/35 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/35">
        TBD
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[5.75rem] w-full rounded-lg border px-4 py-3 text-left text-[13px] font-medium leading-tight shadow-sm transition ${
        selected
          ? "border-black bg-black/[0.04] text-black ring-2 ring-black dark:border-white dark:bg-white/10 dark:text-white dark:ring-white"
          : "border-black/10 bg-white text-black/80 hover:border-black/25 hover:bg-black/[0.02] dark:border-white/10 dark:bg-zinc-950 dark:text-white/80 dark:hover:border-white/25 dark:hover:bg-white/[0.03]"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40">Seed {slot.seed}</div>
      <div className="truncate font-semibold text-black/90 dark:text-white/90">{slot.name}</div>
      <div className="truncate text-[10px] uppercase tracking-wide text-black/45 dark:text-white/45">{slot.guild ?? "Player"}</div>
      <div className={`mt-2 inline-flex self-start rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-wide ${powerClass(slot.power)}`}>
        {slot.power ?? "TBD"}
      </div>
    </button>
  );
}

function BracketMatch({
  title,
  slots,
  heightClass,
  selectedName,
  onSelect,
}: {
  title: string;
  slots: Array<BracketSlot | undefined>;
  heightClass: string;
  selectedName?: string;
  onSelect?: (slot: BracketSlot) => void;
}) {
  return (
    <div className={`relative flex ${heightClass} items-center`}>
      <div className="w-64 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">{title}</div>
        <div className="space-y-5">
          <SlotRow slot={slots[0]} selected={slots[0]?.name === selectedName} onClick={slots[0] ? () => onSelect?.(slots[0]!) : undefined} />
          <SlotRow slot={slots[1]} selected={slots[1]?.name === selectedName} onClick={slots[1] ? () => onSelect?.(slots[1]!) : undefined} />
        </div>
      </div>
      <div className="hidden h-px w-8 bg-black/20 dark:bg-white/20 md:block" aria-hidden />
    </div>
  );
}

export default function GuildGamesPage() {
  const { dmMode } = useDmMode();
  const initialFirstRound = useMemo<Array<[BracketSlot, BracketSlot]>>(
    () =>
      Array.from({ length: 8 }, (_, podIndex) => {
        const start = podIndex * 4;
        const pod = bracketSeeds.slice(start, start + 4);
        const first = pod[0]!;
        const second = pod[1]!;
        const third = pod[2]!;
        const fourth = pod[3]!;
        return [
          { seed: start + 1, name: first, guild: entrantGuilds[first], power: entrantPower[first] },
          { seed: start + 2, name: second, guild: entrantGuilds[second], power: entrantPower[second] },
          { seed: start + 3, name: third, guild: entrantGuilds[third], power: entrantPower[third] },
          { seed: start + 4, name: fourth, guild: entrantGuilds[fourth], power: entrantPower[fourth] },
        ] as [BracketSlot, BracketSlot, BracketSlot, BracketSlot];
      }).flatMap((pod) => [[pod[0], pod[1]], [pod[2], pod[3]]]),
    []
  );

  const [winners, setWinners] = useState<BracketState>(() => emptyBracketState());
  const [saveStatus, setSaveStatus] = useState("Not saved yet");

  useEffect(() => {
    if (hasBracketPicks(winners)) {
      setSaveStatus("Saved in this browser");
      return;
    }

    try {
      const raw = window.localStorage.getItem(BRACKET_STORAGE_KEY);
      if (!raw) return;
      const saved = normalizeBracketState(JSON.parse(raw));
      if (!saved) return;
      setWinners(saved);
      setSaveStatus("Loaded saved bracket");
    } catch {
      setSaveStatus("Could not load saved bracket");
    }
    // This intentionally runs only once so hot reloads do not overwrite active picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(winners));
      setSaveStatus(hasBracketPicks(winners) ? "Saved in this browser" : "Blank bracket saved");
    } catch {
      setSaveStatus("Could not save bracket");
    }
  }, [winners]);

  const derivedRounds = useMemo(() => {
    const rounds: Array<{
      name: string;
      matches: Array<[BracketSlot | undefined, BracketSlot | undefined]>;
      heightClass: string;
    }> = [
      { name: "Round of 32", matches: initialFirstRound, heightClass: "h-60" },
    ];

    const roundNames = ["Round of 16", "Quarterfinals", "Semifinals", "Final"];
    const roundHeights = ["h-[29rem]", "h-[58rem]", "h-[116rem]", "h-[232rem]"];

    let previous: Array<[BracketSlot | undefined, BracketSlot | undefined]> = initialFirstRound;
    for (let roundIndex = 0; roundIndex < 4; roundIndex++) {
      const matchCount = Math.ceil(previous.length / 2);
      const nextMatches: Array<[BracketSlot | undefined, BracketSlot | undefined]> = Array.from({ length: matchCount }, (_, matchIndex) => {
        const sourceA = winners[roundIndex]?.[matchIndex * 2];
        const sourceB = winners[roundIndex]?.[matchIndex * 2 + 1];
        return [sourceA, sourceB] as [BracketSlot | undefined, BracketSlot | undefined];
      });
      rounds.push({
        name: roundNames[roundIndex],
        matches: nextMatches,
        heightClass: roundHeights[roundIndex],
      });
      previous = nextMatches;
    }

    return rounds;
  }, [initialFirstRound, winners]);

  const champion = winners[3]?.[0];

  const promote = (roundIndex: number, matchIndex: number, slot: BracketSlot) => {
    setWinners((prev) => {
      const next = prev.map((round) => [...round]) as BracketState;
      const existing = next[roundIndex]?.[matchIndex];
      const shouldClear = existing?.name === slot.name;

      next[roundIndex][matchIndex] = shouldClear ? undefined : slot;
      for (let i = roundIndex + 1; i < next.length; i++) {
        next[i] = next[i].map(() => undefined);
      }
      return next;
    });
  };

  const resetBracket = () => {
    setWinners(emptyBracketState());
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guild Games</h1>
          <p className="mt-1 max-w-3xl text-black/70 dark:text-white/70">
            Lunaryth&apos;s public path to money, reputation, and access. The Mercantile League gets seven entrants as last year&apos;s winner.
            Every other guild gets five.
          </p>
        </div>

        {dmMode ? (
          <nav className="flex shrink-0 rounded-full border border-black/10 bg-black/[0.03] p-1 text-sm dark:border-white/10 dark:bg-white/5">
            <span className="rounded-full bg-black px-3 py-1.5 font-medium text-white dark:bg-white dark:text-black">
              Bracket
            </span>
            <Link
              href="/guild-games-roster"
              className="rounded-full px-3 py-1.5 text-black/70 transition hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              NPC Roster
            </Link>
          </nav>
        ) : null}
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Where The Guilds Are</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              First-pass public notes from the party&apos;s initial sweep through Lunaryth.
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
                <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs font-semibold text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">32-Person Bracket</h2>
            <p className="mt-1 max-w-3xl text-sm text-black/60 dark:text-white/60">
              Seeding is spread by guild. No guild can face itself in round 1 or round 2 unless Lunaryth officials alter the bracket.
            </p>
            <p className="mt-1 max-w-3xl text-sm text-black/50 dark:text-white/50">
              Swap any seed name with a player name later if the table decides that slot belongs to a PC.
            </p>
            <p className="mt-1 max-w-3xl text-sm text-black/50 dark:text-white/50">
              Power tags are the quick-read guide for NPC matches: Boss should usually advance, High is favored, Mid can be pushed through, and Low is an upset slot.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/60 dark:border-white/10 dark:text-white/60">
              {saveStatus}
            </div>
            <button
              type="button"
              onClick={resetBracket}
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/60 transition hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-black/10 bg-black/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex min-w-[1840px] items-stretch gap-6">
            {derivedRounds.map((round, roundIndex) => (
              <div key={round.name} className="flex w-72 flex-col">
                <div className="sticky top-0 z-10 mb-3 rounded-2xl bg-black px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">
                  {round.name}
                </div>
                <div className="space-y-6">
                  {round.matches.map((match, matchIndex) => (
                    <BracketMatch
                      key={`${round.name}-${matchIndex}`}
                      title={`Match ${matchIndex + 1}`}
                      slots={match}
                      heightClass={round.heightClass}
                      selectedName={winners[roundIndex]?.[matchIndex]?.name}
                      onSelect={(slot) => promote(roundIndex, matchIndex, slot)}
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
                {champion ? (
                  <div className={`w-56 rounded-2xl border px-4 py-4 text-left text-sm shadow-sm ${powerClass(champion.power)}`}>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-black/40 dark:text-white/40">Final Winner</div>
                    <div className="mt-1 font-semibold text-black/90 dark:text-white/90">{champion.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-black/45 dark:text-white/45">{champion.guild ?? "Player"}</div>
                    <div className="mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-wide">
                      {champion.power ?? "TBD"}
                    </div>
                  </div>
                ) : (
                  <div className="w-56 rounded-2xl border border-dashed border-black/15 bg-white p-4 text-center text-sm font-semibold text-black/40 shadow-sm dark:border-white/15 dark:bg-zinc-950 dark:text-white/40">
                    Winner TBD
                  </div>
                )}
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
