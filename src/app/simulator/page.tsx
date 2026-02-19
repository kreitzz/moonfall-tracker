"use client";

import { useEffect, useMemo, useState } from "react";
import { getCampaign } from "@/lib/campaign";

type Combatant = {
  id: string;
  label: string;
  kind: "PC" | "NPC" | "Encounter";
  className?: string;
  spells?: Array<{ name: string; damage?: string }>;
};

type LogEntry = {
  id: string;
  text: string;
};

type StatBlock = {
  hp: number;
  ac: number;
  attackBonus: number;
  damage: string;
};

function parseDamage(formula: string) {
  const cleaned = formula.replace(/\s+/g, "");
  const match = cleaned.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const bonus = match[3] ? Number(match[3]) : 0;
  if (!Number.isFinite(count) || !Number.isFinite(sides) || sides <= 0 || count <= 0) return null;
  return { count, sides, bonus };
}

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count: number, sides: number) {
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0);
  return { rolls, total };
}

export default function BattleSimulatorPage() {
  const campaign = getCampaign();
  const [log, setLog] = useState<LogEntry[]>([]);
  const [duelAId, setDuelAId] = useState<string>("");
  const [duelBId, setDuelBId] = useState<string>("");
  const [duelStats, setDuelStats] = useState<Record<string, StatBlock>>({});

  const combatants = useMemo<Combatant[]>(() => {
    const pcs: Combatant[] = (campaign.party ?? []).map((p, idx) => ({
      id: `pc-${idx}-${p.name}`,
      label: p.name,
      kind: "PC",
      className: p.class,
      spells: getSpellsFromClass(p.class),
    }));
    const npcs: Combatant[] = (campaign.npcs ?? []).map((n) => ({
      id: `npc-${n.id}`,
      label: n.name,
      kind: "NPC",
      className: n.title,
      spells: getSpellsFromClass(n.title),
    }));
    const encounters: Combatant[] = (campaign.battles ?? []).map((b) => ({
      id: `enc-${b.id}`,
      label: b.name,
      kind: "Encounter",
    }));
    return [...pcs, ...npcs, ...encounters];
  }, [campaign]);

  const duelA = combatants.find((c) => c.id === duelAId);
  const duelB = combatants.find((c) => c.id === duelBId);

  useEffect(() => {
    setDuelStats((prev) => {
      const next = { ...prev };
      combatants.forEach((c) => {
        if (!next[c.id]) {
          next[c.id] = defaultStats(c.kind);
        }
      });
      Object.keys(next).forEach((key) => {
        if (!combatants.find((c) => c.id === key)) delete next[key];
      });
      return next;
    });
  }, [combatants]);

  const pushLog = (text: string) => {
    setLog((prev) => [{ id: `${Date.now()}-${Math.random()}`, text }, ...prev]);
  };

  const updateDuelStat = (id: string, patch: Partial<StatBlock>) => {
    setDuelStats((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? defaultStats(combatants.find((c) => c.id === id)?.kind ?? "PC")),
        ...patch,
      },
    }));
  };

  const runDuel = () => {
    if (!duelA || !duelB) return;
    const statsA = duelStats[duelA.id] ?? defaultStats(duelA.kind);
    const statsB = duelStats[duelB.id] ?? defaultStats(duelB.kind);

    let hpA = statsA.hp;
    let hpB = statsB.hp;
    let round = 1;
    const maxRounds = 50;
    const duelLog: string[] = [];

    const attack = (attackerName: string, targetName: string, atkBonus: number, targetAc: number, dmgFormula: string) => {
      const d20 = rollDie(20);
      const total = d20 + atkBonus;
      const crit = d20 === 20;
      const hit = crit ? true : total >= targetAc;
      const parsed = parseDamage(dmgFormula);
      let dmg = 0;
      let dmgLine = "no damage";
      if (parsed && hit) {
        const diceCount = crit ? parsed.count * 2 : parsed.count;
        const rolled = rollDice(diceCount, parsed.sides);
        dmg = rolled.total + parsed.bonus;
        dmgLine = `${rolled.rolls.join("+")}${parsed.bonus ? (parsed.bonus > 0 ? `+${parsed.bonus}` : parsed.bonus) : ""} = ${dmg}`;
      }
      duelLog.push(
        `${attackerName} rolls d20 ${d20} + ${atkBonus} = ${total} vs AC ${targetAc} → ${crit ? "CRIT" : hit ? "HIT" : "MISS"}${
          hit ? `, damage ${dmgLine}` : ""
        }.`
      );
      return hit ? dmg : 0;
    };

    while (hpA > 0 && hpB > 0 && round <= maxRounds) {
      duelLog.push(`Round ${round}`);
      hpB -= attack(duelA.label, duelB.label, statsA.attackBonus, statsB.ac, statsA.damage);
      if (hpB <= 0) break;
      hpA -= attack(duelB.label, duelA.label, statsB.attackBonus, statsA.ac, statsB.damage);
      round += 1;
    }

    const winner = hpA > 0 ? duelA.label : hpB > 0 ? duelB.label : "No one";
    duelLog.push(`Winner: ${winner}. Final HP — ${duelA.label}: ${Math.max(0, hpA)}, ${duelB.label}: ${Math.max(0, hpB)}.`);
    pushLog(`Duel: ${duelA.label} vs ${duelB.label}`);
    duelLog.forEach((line) => pushLog(line));
  };

  function defaultStats(kind: Combatant["kind"]): StatBlock {
    if (kind === "Encounter") return { hp: 20, ac: 13, attackBonus: 4, damage: "1d8+3" };
    if (kind === "NPC") return { hp: 10, ac: 12, attackBonus: 3, damage: "1d6+2" };
    return { hp: 12, ac: 13, attackBonus: 4, damage: "1d8+2" };
  }

  function getSpellsFromClass(className?: string) {
    if (!className) return [];
    const name = className.toLowerCase();
    if (name.includes("cleric")) {
      return [
        { name: "Guiding Bolt", damage: "4d6" },
        { name: "Sacred Flame", damage: "1d8" },
        { name: "Cure Wounds", damage: "1d8+2" },
      ];
    }
    if (name.includes("bard")) {
      return [
        { name: "Vicious Mockery", damage: "1d4" },
        { name: "Dissonant Whispers", damage: "3d6" },
        { name: "Thunderwave", damage: "2d8" },
      ];
    }
    return [];
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Battle Simulator</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Pit two combatants against each other and simulate a full duel.
        </p>
      </header>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Duel Simulator</div>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">
          Pit two combatants against each other and simulate a multi-round duel.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-black/60 dark:text-white/60">Combatant A</label>
            <select
              value={duelAId}
              onChange={(e) => setDuelAId(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
            >
              <option value="">Select combatant</option>
              {combatants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} · {c.kind}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-black/60 dark:text-white/60">Combatant B</label>
            <select
              value={duelBId}
              onChange={(e) => setDuelBId(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
            >
              <option value="">Select combatant</option>
              {combatants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} · {c.kind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {duelA ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold">{duelA.label}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  HP
                  <input
                    value={duelStats[duelA.id]?.hp ?? 0}
                    onChange={(e) => updateDuelStat(duelA.id, { hp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="HP"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  AC
                  <input
                    value={duelStats[duelA.id]?.ac ?? 0}
                    onChange={(e) => updateDuelStat(duelA.id, { ac: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="AC"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  Attack Bonus
                  <input
                    value={duelStats[duelA.id]?.attackBonus ?? 0}
                    onChange={(e) => updateDuelStat(duelA.id, { attackBonus: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="Attack Bonus"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  Damage
                  <input
                    value={duelStats[duelA.id]?.damage ?? "1d8+2"}
                    onChange={(e) => updateDuelStat(duelA.id, { damage: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="Damage (e.g., 1d8+2)"
                  />
                </label>
                {duelA.spells?.length ? (
                  <label className="space-y-1 text-xs text-black/60 dark:text-white/60 sm:col-span-2">
                    Spell / Attack
                    <select
                      onChange={(e) => {
                        const selected = duelA.spells?.find((s) => s.name === e.target.value);
                        if (selected?.damage) updateDuelStat(duelA.id, { damage: selected.damage });
                      }}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    >
                      <option value="">Basic attack</option>
                      {duelA.spells.map((spell) => (
                        <option key={spell.name} value={spell.name}>
                          {spell.name}{spell.damage ? ` — ${spell.damage}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}

          {duelB ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold">{duelB.label}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  HP
                  <input
                    value={duelStats[duelB.id]?.hp ?? 0}
                    onChange={(e) => updateDuelStat(duelB.id, { hp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="HP"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  AC
                  <input
                    value={duelStats[duelB.id]?.ac ?? 0}
                    onChange={(e) => updateDuelStat(duelB.id, { ac: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="AC"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  Attack Bonus
                  <input
                    value={duelStats[duelB.id]?.attackBonus ?? 0}
                    onChange={(e) => updateDuelStat(duelB.id, { attackBonus: Number(e.target.value) })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="Attack Bonus"
                  />
                </label>
                <label className="space-y-1 text-xs text-black/60 dark:text-white/60">
                  Damage
                  <input
                    value={duelStats[duelB.id]?.damage ?? "1d8+2"}
                    onChange={(e) => updateDuelStat(duelB.id, { damage: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    placeholder="Damage (e.g., 1d8+2)"
                  />
                </label>
                {duelB.spells?.length ? (
                  <label className="space-y-1 text-xs text-black/60 dark:text-white/60 sm:col-span-2">
                    Spell / Attack
                    <select
                      onChange={(e) => {
                        const selected = duelB.spells?.find((s) => s.name === e.target.value);
                        if (selected?.damage) updateDuelStat(duelB.id, { damage: selected.damage });
                      }}
                      className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black dark:border-white/10 dark:text-white"
                    >
                      <option value="">Basic attack</option>
                      {duelB.spells.map((spell) => (
                        <option key={spell.name} value={spell.name}>
                          {spell.name}{spell.damage ? ` — ${spell.damage}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={runDuel}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Simulate duel
          </button>
          <button
            onClick={() => setLog([])}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
          >
            Clear log
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Combat Log</div>
        {log.length ? (
          <div className="mt-3 space-y-3 text-sm text-black/80 dark:text-white/80">
            {log.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/5">
                {entry.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-black/60 dark:text-white/60">No rolls yet.</div>
        )}
      </section>
    </div>
  );
}
