"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AbilityField = {
  score?: string;
  modifier?: string;
};

type EditableCharacterSheetData = {
  basics?: Record<string, string>;
  abilityScores?: Record<string, AbilityField>;
  coreStats?: Record<string, string>;
  savingThrowProficiencies?: Record<string, string>;
  spellSlots?: Record<string, string>;
  skills?: string;
  toolProficiencies?: string;
  weaponProficiencies?: string;
  armorProficiencies?: string;
  languages?: string;
  attacks?: string;
  featuresTraits?: string;
  equipment?: string;
  backstory?: string;
  notes?: string;
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function Field({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full rounded-xl border px-3 py-2 text-sm text-amber-950 outline-none transition placeholder:text-amber-950/35 ${
          readOnly
            ? "border-amber-950/10 bg-[#f4ead1] font-semibold"
            : "border-amber-950/20 bg-[#fffdf6] focus:border-amber-800/40 focus:bg-white"
        }`}
      />
    </label>
  );
}

function TextBlock({
  label,
  value,
  onChange,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/60">{label}</div>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-amber-950/20 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 outline-none transition placeholder:text-amber-950/35 focus:border-amber-800/40 focus:bg-white"
      />
    </label>
  );
}

function formatModifier(scoreValue?: string, fallback?: string) {
  const score = Number.parseInt(scoreValue ?? "", 10);
  if (Number.isNaN(score)) return fallback ?? "";
  const modifier = Math.floor((score - 10) / 2);
  return `${modifier >= 0 ? "+" : ""}${modifier}`;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-amber-950/15 bg-[#fff9ea] px-3 py-2 text-sm text-amber-950">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/60">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-amber-950/30 text-amber-800 focus:ring-amber-700"
      />
    </label>
  );
}

function parseCount(value?: string) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isNaN(n) ? 0 : n;
}

const ABILITY_LABELS: Array<{ key: string; label: string }> = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

const ALL_SKILLS: Array<{ name: string; ability: string }> = [
  { name: "Acrobatics", ability: "dexterity" },
  { name: "Animal Handling", ability: "wisdom" },
  { name: "Arcana", ability: "intelligence" },
  { name: "Athletics", ability: "strength" },
  { name: "Deception", ability: "charisma" },
  { name: "History", ability: "intelligence" },
  { name: "Insight", ability: "wisdom" },
  { name: "Intimidation", ability: "charisma" },
  { name: "Investigation", ability: "intelligence" },
  { name: "Medicine", ability: "wisdom" },
  { name: "Nature", ability: "intelligence" },
  { name: "Perception", ability: "wisdom" },
  { name: "Performance", ability: "charisma" },
  { name: "Persuasion", ability: "charisma" },
  { name: "Religion", ability: "intelligence" },
  { name: "Sleight of Hand", ability: "dexterity" },
  { name: "Stealth", ability: "dexterity" },
  { name: "Survival", ability: "wisdom" },
];

export default function EditableCharacterSheet({
  storageKey,
  apiSlug,
  initialData,
}: {
  storageKey: string;
  apiSlug: string;
  initialData: EditableCharacterSheetData | Record<string, unknown>;
}) {
  const defaults = useMemo(() => deepClone(initialData as EditableCharacterSheetData), [initialData]);
  const [sheet, setSheet] = useState<EditableCharacterSheetData>(defaults);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const lastSavedRef = useRef<EditableCharacterSheetData>(defaults);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/party-sheets/${apiSlug}`, { cache: "no-store" });
        const payload = (await res.json()) as { ok: boolean; data?: EditableCharacterSheetData | null };
        if (!cancelled && payload.ok && payload.data) {
          const next = { ...defaults, ...payload.data };
          lastSavedRef.current = deepClone(next);
          setSheet(next);
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // ignore
          }
          setHasLoaded(true);
          setIsHydrating(false);
          return;
        }
      } catch {
        // ignore fetch failures and fall through to browser/default copy
      }

      try {
        const raw = localStorage.getItem(storageKey);
        if (!cancelled && raw) {
          const next = { ...defaults, ...JSON.parse(raw) };
          setSheet(next);
          setIsHydrating(false);
          return;
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setHasLoaded(true);
      }

      if (!cancelled) {
        setSheet(defaults);
        lastSavedRef.current = deepClone(defaults);
        setHasLoaded(true);
        setIsHydrating(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [apiSlug, defaults, storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sheet));
    } catch {
      // ignore storage failures
    }
  }, [hasLoaded, sheet, storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/party-sheets/${apiSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheet),
        });
        if (!res.ok) throw new Error("Save failed");
        lastSavedRef.current = deepClone(sheet);
      } catch {
        // ignore save failures; localStorage still holds browser copy
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [apiSlug, hasLoaded, sheet]);

  const updateBasics = (key: string, value: string) =>
    setSheet((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [key]: value,
      },
    }));

  const updateCoreStats = (key: string, value: string) =>
    setSheet((prev) => ({
      ...prev,
      coreStats: {
        ...(prev.coreStats ?? {}),
        [key]: value,
      },
    }));

  const updateAbility = (ability: string, field: keyof AbilityField, value: string) =>
    setSheet((prev) => ({
      ...prev,
      abilityScores: {
        ...(prev.abilityScores ?? {}),
        [ability]: {
          ...((prev.abilityScores ?? {})[ability] ?? {}),
          [field]: value,
        },
      },
    }));

  const updateText = (key: keyof EditableCharacterSheetData, value: string) =>
    setSheet((prev) => ({
      ...prev,
      [key]: value,
    }));

  const updateSavingThrowProficiency = (key: string, value: boolean) =>
    setSheet((prev) => ({
      ...prev,
      savingThrowProficiencies: {
        ...(prev.savingThrowProficiencies ?? {}),
        [key]: String(value),
      },
    }));

  const updateSpellSlots = (key: string, value: string) =>
    setSheet((prev) => ({
      ...prev,
      spellSlots: {
        ...(prev.spellSlots ?? {}),
        [key]: value,
      },
    }));

  const spendSpellSlot = (level: number) =>
    setSheet((prev) => {
      const currentKey = `level${level}Current`;
      const current = Math.max(0, parseCount(prev.spellSlots?.[currentKey]) - 1);
      return {
        ...prev,
        spellSlots: {
          ...(prev.spellSlots ?? {}),
          [currentKey]: String(current),
        },
      };
    });

  const restoreSpellSlots = (level: number) =>
    setSheet((prev) => {
      const currentKey = `level${level}Current`;
      const maxKey = `level${level}Max`;
      const max = parseCount(prev.spellSlots?.[maxKey]);
      return {
        ...prev,
        spellSlots: {
          ...(prev.spellSlots ?? {}),
          [currentKey]: String(max),
        },
      };
    });

  const resetSheet = () => {
    const next = deepClone(lastSavedRef.current ?? defaults);
    setSheet(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const sectionClass =
    "rounded-[28px] border border-amber-950/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_42%),linear-gradient(180deg,#fbf3df,#f3e4c0)] p-5 shadow-[0_12px_30px_rgba(80,49,12,0.08)] text-amber-950";
  const panelClass = "rounded-[24px] border border-amber-950/20 bg-[rgba(255,251,241,0.88)] p-4";
  const proficiencyBonus = Number.parseInt((sheet.coreStats?.proficiencyBonus ?? "0").replace("+", ""), 10) || 0;

  function inferredSavingThrow(key: string) {
    const mod = Number.parseInt(formatModifier(sheet.abilityScores?.[key]?.score, sheet.abilityScores?.[key]?.modifier).replace("+", ""), 10) || 0;
    const proficient = sheet.savingThrowProficiencies?.[key] === "true";
    const total = mod + (proficient ? proficiencyBonus : 0);
    return `${total >= 0 ? "+" : ""}${total}`;
  }

  const explicitSkillBonuses = useMemo(() => {
    const map = new Map<string, string>();
    for (const line of (sheet.skills ?? "").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = trimmed.match(/^(.*?)\s*\(([+-]?\d+)\)\s*$/);
      if (match) {
        const [, name, bonus] = match;
        map.set(name.trim().toLowerCase(), bonus.startsWith("+") || bonus.startsWith("-") ? bonus : `+${bonus}`);
      }
    }
    return map;
  }, [sheet.skills]);

  function inferredSkillBonus(skillName: string, ability: string) {
    const explicit = explicitSkillBonuses.get(skillName.toLowerCase());
    if (explicit) return explicit;
    const mod = Number.parseInt(
      formatModifier(sheet.abilityScores?.[ability]?.score, sheet.abilityScores?.[ability]?.modifier).replace("+", ""),
      10
    ) || 0;
    return `${mod >= 0 ? "+" : ""}${mod}`;
  }

  if (isHydrating) {
    return (
      <section className="rounded-[28px] border border-amber-950/15 bg-[#f2e6c9] p-6 text-center text-sm text-amber-950/70 shadow-[0_20px_60px_rgba(74,44,19,0.08)]">
        Loading character sheet...
      </section>
    );
  }

  return (
    <div className="space-y-6 text-amber-950">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetSheet}
          className="rounded-lg border border-amber-950/15 bg-[#fff9ea] px-3 py-2 text-sm text-amber-950 transition hover:bg-white"
        >
          Reset to saved
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Identity</div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Character Name" value={sheet.basics?.characterName ?? ""} onChange={(v) => updateBasics("characterName", v)} />
            <Field label="Class / Level" value={sheet.basics?.classLevel ?? ""} onChange={(v) => updateBasics("classLevel", v)} />
            <Field label="Background" value={sheet.basics?.background ?? ""} onChange={(v) => updateBasics("background", v)} />
            <Field label="Race" value={sheet.basics?.race ?? ""} onChange={(v) => updateBasics("race", v)} />
            <Field label="Alignment" value={sheet.basics?.alignment ?? ""} onChange={(v) => updateBasics("alignment", v)} />
            <Field label="Age" value={sheet.basics?.age ?? ""} onChange={(v) => updateBasics("age", v)} />
            <Field label="Height" value={sheet.basics?.height ?? ""} onChange={(v) => updateBasics("height", v)} />
            <Field label="Weight" value={sheet.basics?.weight ?? ""} onChange={(v) => updateBasics("weight", v)} />
            <Field label="Eyes" value={sheet.basics?.eyes ?? ""} onChange={(v) => updateBasics("eyes", v)} />
            <Field label="Hair" value={sheet.basics?.hair ?? ""} onChange={(v) => updateBasics("hair", v)} />
            <Field label="Skin" value={sheet.basics?.skin ?? ""} onChange={(v) => updateBasics("skin", v)} />
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Combat Record</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Armor Class" value={sheet.coreStats?.armorClass ?? ""} onChange={(v) => updateCoreStats("armorClass", v)} />
            <Field label="Initiative" value={sheet.coreStats?.initiative ?? ""} onChange={(v) => updateCoreStats("initiative", v)} />
            <Field label="Current HP" value={sheet.coreStats?.currentHp ?? ""} onChange={(v) => updateCoreStats("currentHp", v)} />
            <Field label="Max HP" value={sheet.coreStats?.maxHp ?? ""} onChange={(v) => updateCoreStats("maxHp", v)} />
            <Field label="Speed" value={sheet.coreStats?.speed ?? ""} onChange={(v) => updateCoreStats("speed", v)} />
            <Field label="Hit Dice" value={sheet.coreStats?.hitDice ?? ""} onChange={(v) => updateCoreStats("hitDice", v)} />
            <Field label="Proficiency Bonus" value={sheet.coreStats?.proficiencyBonus ?? ""} onChange={(v) => updateCoreStats("proficiencyBonus", v)} />
            <Field label="Passive Perception" value={sheet.coreStats?.passivePerception ?? ""} onChange={(v) => updateCoreStats("passivePerception", v)} />
          </div>
        </section>
      </div>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Ability Scores</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {ABILITY_LABELS.map(({ key, label }) => (
            <div key={key} className={panelClass}>
              <div className="mb-3 flex min-h-[2.75rem] items-center justify-center text-center font-serif text-sm font-semibold leading-snug tracking-[0.02em]">
                {label}
              </div>
              <div className="space-y-3">
                <Field label="Score" value={sheet.abilityScores?.[key]?.score ?? ""} onChange={(v) => updateAbility(key, "score", v)} />
                <Field
                  label="Modifier"
                  value={formatModifier(sheet.abilityScores?.[key]?.score, sheet.abilityScores?.[key]?.modifier)}
                  onChange={() => {}}
                  readOnly
                />
                <Field label={`${label} Save`} value={inferredSavingThrow(key)} onChange={() => {}} readOnly />
                <Toggle
                  label="Save Proficient"
                  checked={sheet.savingThrowProficiencies?.[key] === "true"}
                  onChange={(checked) => updateSavingThrowProficiency(key, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Spell Slots</div>
          <div className="space-y-4">
            {[1, 2, 3].map((level) => (
              <div key={`spell-${level}`} className={panelClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-serif text-base font-semibold">Level {level}</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => spendSpellSlot(level)}
                      className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-white"
                    >
                      Use 1
                    </button>
                    <button
                      type="button"
                      onClick={() => restoreSpellSlots(level)}
                      className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-white"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Current"
                    value={sheet.spellSlots?.[`level${level}Current`] ?? ""}
                    onChange={(v) => updateSpellSlots(`level${level}Current`, v)}
                  />
                  <Field
                    label="Max"
                    value={sheet.spellSlots?.[`level${level}Max`] ?? ""}
                    onChange={(v) => updateSpellSlots(`level${level}Max`, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Skill Check Reference</div>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {ALL_SKILLS.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center justify-between rounded-xl border border-amber-950/10 bg-[#fff9ea] px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{skill.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-amber-950/55">
                    {ABILITY_LABELS.find((item) => item.key === skill.ability)?.label}
                  </div>
                </div>
                <div className="text-base font-semibold">{inferredSkillBonus(skill.name, skill.ability)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Proficiencies</div>
          <div className="mb-4 rounded-xl border border-amber-950/10 bg-[#fff9ea] px-3 py-2 text-xs leading-relaxed text-amber-950/70">
            Enter one item per line. For skill bonuses, use the format <span className="font-semibold">Skill Name (+X)</span>, for example
            {" "}
            <span className="font-semibold">Deception (+6)</span>.
          </div>
          <div className="space-y-4">
            <TextBlock label="Skill Bonuses" value={sheet.skills ?? ""} onChange={(v) => updateText("skills", v)} rows={8} />
            <TextBlock label="Tool Proficiencies" value={sheet.toolProficiencies ?? ""} onChange={(v) => updateText("toolProficiencies", v)} rows={4} />
            <TextBlock label="Weapon Proficiencies" value={sheet.weaponProficiencies ?? ""} onChange={(v) => updateText("weaponProficiencies", v)} rows={5} />
            <TextBlock label="Armor Proficiencies" value={sheet.armorProficiencies ?? ""} onChange={(v) => updateText("armorProficiencies", v)} rows={3} />
            <TextBlock label="Languages" value={sheet.languages ?? ""} onChange={(v) => updateText("languages", v)} rows={4} />
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Actions and Features</div>
          <div className="space-y-4">
            <TextBlock label="Attacks" value={sheet.attacks ?? ""} onChange={(v) => updateText("attacks", v)} rows={5} />
            <TextBlock label="Features and Traits" value={sheet.featuresTraits ?? ""} onChange={(v) => updateText("featuresTraits", v)} rows={12} />
            <TextBlock label="Equipment" value={sheet.equipment ?? ""} onChange={(v) => updateText("equipment", v)} rows={8} />
          </div>
        </section>
      </div>

      <section className={sectionClass}>
        <div className="mb-4 border-b border-amber-950/15 pb-2 font-serif text-xl font-semibold tracking-[0.06em]">Story and Notes</div>
        <div className="space-y-4">
          <TextBlock label="Backstory" value={sheet.backstory ?? ""} onChange={(v) => updateText("backstory", v)} rows={14} />
          <TextBlock label="Notes" value={sheet.notes ?? ""} onChange={(v) => updateText("notes", v)} rows={6} />
        </div>
      </section>
    </div>
  );
}
