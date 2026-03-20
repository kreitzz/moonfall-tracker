"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CampaignItem } from "@/lib/campaign";

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
  familiar?: {
    enabled?: string;
    name?: string;
    type?: string;
    armorClass?: string;
    hp?: string;
    speed?: string;
    abilities?: string;
    specialTrait?: string;
    notes?: string;
  };
};

type ChangeLogEntry = {
  id: string;
  at: string;
  description: string;
};

type PersistedPayload = {
  sheet: EditableCharacterSheetData;
  changelog: ChangeLogEntry[];
};

const TABS = ["overview", "stats", "combat", "magic", "familiar", "story", "log"] as const;
type TabKey = (typeof TABS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  stats: "Stats",
  combat: "Combat",
  magic: "Magic",
  familiar: "Familiar",
  story: "Story",
  log: "Log",
};

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

const FIELD_LABELS: Record<string, string> = {
  "basics.characterName": "Character Name",
  "basics.classLevel": "Class / Level",
  "basics.background": "Background",
  "basics.race": "Race",
  "basics.alignment": "Alignment",
  "basics.age": "Age",
  "basics.height": "Height",
  "basics.weight": "Weight",
  "basics.eyes": "Eyes",
  "basics.hair": "Hair",
  "basics.skin": "Skin",
  "coreStats.armorClass": "Armor Class",
  "coreStats.initiative": "Initiative",
  "coreStats.currentHp": "Current HP",
  "coreStats.maxHp": "Max HP",
  "coreStats.speed": "Speed",
  "coreStats.hitDice": "Hit Dice",
  "coreStats.proficiencyBonus": "Proficiency Bonus",
  "coreStats.passivePerception": "Passive Perception",
  attacks: "Attacks",
  featuresTraits: "Features and Traits",
  equipment: "Equipment",
  backstory: "Backstory",
  notes: "Notes",
  skills: "Skill Bonuses",
  toolProficiencies: "Tool Proficiencies",
  weaponProficiencies: "Weapon Proficiencies",
  armorProficiencies: "Armor Proficiencies",
  languages: "Languages",
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseCount(value?: string) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isNaN(n) ? 0 : n;
}

function formatModifier(scoreValue?: string, fallback?: string) {
  const score = Number.parseInt(scoreValue ?? "", 10);
  if (Number.isNaN(score)) return fallback ?? "";
  const modifier = Math.floor((score - 10) / 2);
  return `${modifier >= 0 ? "+" : ""}${modifier}`;
}

function linesFromText(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function textFromLines(lines: string[]) {
  return lines.join("\n");
}

function isPersistedPayload(value: unknown): value is PersistedPayload {
  return Boolean(value && typeof value === "object" && "sheet" in value);
}

function makeEntry(description: string): ChangeLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    description,
  };
}

function describeChange(path: string, oldValue: string | boolean | undefined, newValue: string | boolean) {
  const label = FIELD_LABELS[path] ?? path;
  if (typeof newValue === "boolean") {
    return `${label}: ${newValue ? "enabled" : "disabled"}`;
  }

  const oldText = String(oldValue ?? "").trim();
  const newText = String(newValue).trim();
  if (!oldText && newText) return `${label}: filled in`;
  if (oldText && !newText) return `${label}: cleared`;
  return `${label}: updated`;
}

function addLogEntry(entries: ChangeLogEntry[], description: string) {
  return [makeEntry(description), ...entries].slice(0, 150);
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

function StepField({
  label,
  value,
  onChange,
  step = 1,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
}) {
  const numericValue = parseCount(value);

  function apply(next: number) {
    const bounded = min !== undefined ? Math.max(min, next) : next;
    onChange(String(bounded));
  }

  return (
    <label className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/60">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border border-amber-950/20 bg-[#fffdf6] px-2 py-2">
        <button
          type="button"
          onClick={() => apply(numericValue - step)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-950/15 bg-[#f7ecd4] text-base font-semibold text-amber-950 transition hover:bg-white"
        >
          -
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-center text-sm font-semibold text-amber-950 outline-none"
        />
        <button
          type="button"
          onClick={() => apply(numericValue + step)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-950/15 bg-[#f7ecd4] text-base font-semibold text-amber-950 transition hover:bg-white"
        >
          +
        </button>
      </div>
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

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 border-b border-amber-950/15 pb-2">
      <div className="font-serif text-xl font-semibold tracking-[0.06em] text-amber-950">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-amber-950/65">{subtitle}</div> : null}
    </div>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-3 py-3 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">{label}</div>
      <div className="mt-1 font-serif text-xl font-semibold text-amber-950">{value || "—"}</div>
    </div>
  );
}

function SnapshotHpEditor({
  current,
  max,
  onCurrentChange,
  onMaxChange,
}: {
  current: string;
  max: string;
  onCurrentChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}) {
  const currentValue = parseCount(current);

  return (
    <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-3 py-3">
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">HP</div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 gap-y-1">
        <input
          value={current}
          onChange={(e) => onCurrentChange(e.target.value)}
          className="min-w-0 bg-transparent text-center font-serif text-lg font-semibold text-amber-950 outline-none"
        />
        <span className="text-center text-amber-950/55">/</span>
        <input
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="min-w-0 bg-transparent text-center font-serif text-lg font-semibold text-amber-950 outline-none"
        />
        <button
          type="button"
          onClick={() => onCurrentChange(String(Math.max(0, currentValue - 1)))}
          className="flex h-7 w-full items-center justify-center rounded-lg border border-amber-950/15 bg-[#f7ecd4] text-sm font-semibold text-amber-950 hover:bg-white"
        >
          -
        </button>
        <div className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-950/45">
          Adjust
        </div>
        <button
          type="button"
          onClick={() => onCurrentChange(String(currentValue + 1))}
          className="flex h-7 w-full items-center justify-center rounded-lg border border-amber-950/15 bg-[#f7ecd4] text-sm font-semibold text-amber-950 hover:bg-white"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function EditableCharacterSheet({
  storageKey,
  apiSlug,
  initialData,
  keyItems = [],
}: {
  storageKey: string;
  apiSlug: string;
  initialData: EditableCharacterSheetData | Record<string, unknown>;
  keyItems?: CampaignItem[];
}) {
  const defaults = useMemo(() => deepClone(initialData as EditableCharacterSheetData), [initialData]);
  const [sheet, setSheet] = useState<EditableCharacterSheetData>(defaults);
  const [changelog, setChangelog] = useState<ChangeLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [undoEquipment, setUndoEquipment] = useState<{ item: string; index: number } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("Saved copy will sync here.");
  const lastSavedRef = useRef<EditableCharacterSheetData>(defaults);
  const lastSavedLogRef = useRef<ChangeLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/party-sheets/${apiSlug}`, { cache: "no-store" });
        const payload = (await res.json()) as { ok: boolean; data?: PersistedPayload | EditableCharacterSheetData | null; source?: string };
        if (!cancelled && payload.ok && payload.data) {
          if (isPersistedPayload(payload.data)) {
            const nextSheet = { ...defaults, ...payload.data.sheet };
            const nextLog = payload.data.changelog ?? [];
            lastSavedRef.current = deepClone(nextSheet);
            lastSavedLogRef.current = deepClone(nextLog);
            setSheet(nextSheet);
            setChangelog(nextLog);
            setSaveMessage(payload.source === "supabase" ? "Loaded saved website copy." : "Loaded saved local copy.");
            try {
              localStorage.setItem(storageKey, JSON.stringify({ sheet: nextSheet, changelog: nextLog }));
            } catch {
              // ignore
            }
          } else {
            const legacySheet = { ...defaults, ...(payload.data as EditableCharacterSheetData) };
            lastSavedRef.current = deepClone(legacySheet);
            lastSavedLogRef.current = [];
            setSheet(legacySheet);
            setChangelog([]);
            setSaveMessage("Loaded saved website copy.");
            try {
              localStorage.setItem(storageKey, JSON.stringify({ sheet: legacySheet, changelog: [] }));
            } catch {
              // ignore
            }
          }
          setHasLoaded(true);
          setIsHydrating(false);
          return;
        }
      } catch {
        // ignore fetch failures and fall through
      }

      try {
        const raw = localStorage.getItem(storageKey);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as PersistedPayload | EditableCharacterSheetData;
          if (isPersistedPayload(parsed)) {
            setSheet({ ...defaults, ...parsed.sheet });
            setChangelog(parsed.changelog ?? []);
          } else {
            setSheet({ ...defaults, ...parsed });
            setChangelog([]);
          }
          setSaveMessage("Loaded browser draft copy.");
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
        setChangelog([]);
        lastSavedRef.current = deepClone(defaults);
        lastSavedLogRef.current = [];
        setSaveMessage("Using default sheet.");
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
      localStorage.setItem(storageKey, JSON.stringify({ sheet, changelog }));
    } catch {
      // ignore storage failures
    }
  }, [changelog, hasLoaded, sheet, storageKey]);

  useEffect(() => {
    if (!hasLoaded) return;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/party-sheets/${apiSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheet, changelog }),
        });
        if (!res.ok) throw new Error("Save failed");
        lastSavedRef.current = deepClone(sheet);
        lastSavedLogRef.current = deepClone(changelog);
        const payload = (await res.json()) as { ok: boolean; source?: string };
        setSaveMessage(payload.source === "supabase" ? "Saved to website." : "Saved to local fallback.");
      } catch {
        setSaveMessage("Saved in this browser only.");
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [apiSlug, changelog, hasLoaded, sheet]);

  const sectionClass =
    "rounded-[28px] border border-amber-950/20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_42%),linear-gradient(180deg,#fbf3df,#f3e4c0)] p-4 shadow-[0_12px_30px_rgba(80,49,12,0.08)] text-amber-950";
  const panelClass = "rounded-[22px] border border-amber-950/20 bg-[rgba(255,251,241,0.88)] p-3.5";
  const proficiencyBonus = Number.parseInt((sheet.coreStats?.proficiencyBonus ?? "0").replace("+", ""), 10) || 0;
  const classLevelText = (sheet.basics?.classLevel ?? "").toLowerCase();
  const primaryAbility =
    classLevelText.includes("bard") ||
    classLevelText.includes("paladin") ||
    classLevelText.includes("sorcerer") ||
    classLevelText.includes("warlock")
      ? "charisma"
      : classLevelText.includes("cleric") ||
          classLevelText.includes("druid") ||
          classLevelText.includes("ranger") ||
          classLevelText.includes("monk")
        ? "wisdom"
        : classLevelText.includes("wizard") || classLevelText.includes("artificer")
          ? "intelligence"
          : null;
  const spellModifier =
    primaryAbility ? Number.parseInt(formatModifier(sheet.abilityScores?.[primaryAbility]?.score).replace("+", ""), 10) || 0 : null;
  const spellSaveDc = primaryAbility ? String(8 + proficiencyBonus + (spellModifier ?? 0)) : "";
  const spellAttackBonus = primaryAbility ? `${proficiencyBonus + (spellModifier ?? 0) >= 0 ? "+" : ""}${proficiencyBonus + (spellModifier ?? 0)}` : "";

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

  const equipmentLines = useMemo(() => linesFromText(sheet.equipment), [sheet.equipment]);
  const attackRows = useMemo(
    () =>
      linesFromText(sheet.attacks).map((line) => {
        const parts = line.split("—").map((part) => part.trim());
        return {
          name: parts[0] ?? "",
          bonus: parts[1] ?? "",
          damage: parts.slice(2).join(" — "),
        };
      }),
    [sheet.attacks]
  );
  const featureBlocks = useMemo(
    () =>
      (sheet.featuresTraits ?? "")
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
          const [headline, ...rest] = block.split("\n");
          const quick = /^\[quick\]\s*/i.test(headline.trim());
          return {
            title: headline.trim().replace(/^\[quick\]\s*/i, ""),
            details: rest.join("\n").trim(),
            quick,
          };
        }),
    [sheet.featuresTraits]
  );
  const quickActionFeatures = useMemo(
    () =>
      featureBlocks.filter(
        (block) =>
          block.quick ||
          /bardic inspiration|rage|sneak attack|cunning action|action surge|wild shape|channel divinity|flourish/i.test(block.title)
      ),
    [featureBlocks]
  );
  const quickActionTrackers = useMemo(
    () =>
      quickActionFeatures.map((feature, index) => {
        const match = feature.title.match(/\((\d+)\s+uses?\)/i);
        const maxUses = match ? Number.parseInt(match[1], 10) : 0;
        const trackerKey = `quickAction:${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}:${index}`;
        const remaining = maxUses > 0 ? parseCount(sheet.coreStats?.[trackerKey] ?? String(maxUses)) : 0;
        return {
          ...feature,
          maxUses,
          trackerKey,
          remaining,
        };
      }),
    [quickActionFeatures, sheet.coreStats]
  );
  const hasMooMooBond = useMemo(
    () => keyItems.some((item) => /moomoo|moo moo/i.test(item.title)),
    [keyItems]
  );
  const familiarEnabled = sheet.familiar?.enabled === "true" || hasMooMooBond;
  const familiarData = {
    name: sheet.familiar?.name ?? (hasMooMooBond ? "Admiral MooMoo" : ""),
    type: sheet.familiar?.type ?? (hasMooMooBond ? "Spectral familiar" : ""),
    armorClass: sheet.familiar?.armorClass ?? (hasMooMooBond ? "10" : ""),
    hp: sheet.familiar?.hp ?? (hasMooMooBond ? "5 × level" : ""),
    speed: sheet.familiar?.speed ?? (hasMooMooBond ? "30 ft" : ""),
    abilities:
      sheet.familiar?.abilities ??
      (hasMooMooBond
        ? "Darkvision 30 ft\nUnderstands the bonded creature's languages\nCan Dash, Disengage, and Dodge\nCan carry light loads and act as a scout through shared senses\nGrants advantage on nearby Animal Handling checks"
        : ""),
    specialTrait:
      sheet.familiar?.specialTrait ??
      (hasMooMooBond
        ? "Comfort of the Herd — Once per long rest, while MooMoo is within 10 feet, reroll one failed Wisdom saving throw and use the new result."
        : ""),
    notes:
      sheet.familiar?.notes ??
      "",
  };

  function pushLog(description: string) {
    setChangelog((prev) => addLogEntry(prev, description));
  }

  function updateBasics(key: string, value: string) {
    const path = `basics.${key}`;
    const oldValue = sheet.basics?.[key] ?? "";
    if (oldValue === value) return;
    setSheet((prev) => ({
      ...prev,
      basics: {
        ...(prev.basics ?? {}),
        [key]: value,
      },
    }));
    pushLog(describeChange(path, oldValue, value));
  }

  function updateCoreStats(key: string, value: string) {
    const path = `coreStats.${key}`;
    const oldValue = sheet.coreStats?.[key] ?? "";
    if (oldValue === value) return;
    setSheet((prev) => ({
      ...prev,
      coreStats: {
        ...(prev.coreStats ?? {}),
        [key]: value,
      },
    }));
    pushLog(describeChange(path, oldValue, value));
  }

  function updateAbility(ability: string, field: keyof AbilityField, value: string) {
    const path = `${ability}.${field}`;
    const oldValue = sheet.abilityScores?.[ability]?.[field] ?? "";
    if (oldValue === value) return;
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
    pushLog(describeChange(path, oldValue, value));
  }

  function updateText(key: keyof EditableCharacterSheetData, value: string) {
    const oldValue = String(sheet[key] ?? "");
    if (oldValue === value) return;
    setSheet((prev) => ({ ...prev, [key]: value }));
    pushLog(describeChange(String(key), oldValue, value));
  }

  function updateSavingThrowProficiency(key: string, value: boolean) {
    const oldValue = sheet.savingThrowProficiencies?.[key] === "true";
    if (oldValue === value) return;
    setSheet((prev) => ({
      ...prev,
      savingThrowProficiencies: {
        ...(prev.savingThrowProficiencies ?? {}),
        [key]: String(value),
      },
    }));
    pushLog(`${ABILITY_LABELS.find((item) => item.key === key)?.label ?? key} save proficiency ${value ? "added" : "removed"}.`);
  }

  function updateSpellSlots(key: string, value: string) {
    const oldValue = sheet.spellSlots?.[key] ?? "";
    if (oldValue === value) return;
    setSheet((prev) => ({
      ...prev,
      spellSlots: {
        ...(prev.spellSlots ?? {}),
        [key]: value,
      },
    }));
    pushLog(`Spell slots: ${key} updated.`);
  }

  function updateFamiliar(key: keyof NonNullable<EditableCharacterSheetData["familiar"]>, value: string) {
    const oldValue = sheet.familiar?.[key] ?? "";
    if (oldValue === value) return;
    setSheet((prev) => ({
      ...prev,
      familiar: {
        ...(prev.familiar ?? {}),
        [key]: value,
      },
    }));
    pushLog(describeChange(`familiar.${String(key)}`, oldValue, value));
  }

  function spendSpellSlot(level: number) {
    const currentKey = `level${level}Current`;
    const current = parseCount(sheet.spellSlots?.[currentKey]);
    if (current <= 0) return;
    const next = current - 1;
    setSheet((prev) => ({
      ...prev,
      spellSlots: {
        ...(prev.spellSlots ?? {}),
        [currentKey]: String(next),
      },
    }));
    pushLog(`Spell slots: used a level ${level} slot (${next} left).`);
  }

  function restoreSpellSlots(level: number) {
    const currentKey = `level${level}Current`;
    const maxKey = `level${level}Max`;
    const current = parseCount(sheet.spellSlots?.[currentKey]);
    const max = parseCount(sheet.spellSlots?.[maxKey]);
    if (current === max) return;
    setSheet((prev) => ({
      ...prev,
      spellSlots: {
        ...(prev.spellSlots ?? {}),
        [currentKey]: String(max),
      },
    }));
    pushLog(`Spell slots: reset level ${level} to ${max}.`);
  }

  function resetSheet() {
    const next = deepClone(lastSavedRef.current ?? defaults);
    const nextLog = deepClone(lastSavedLogRef.current ?? []);
    setSheet(next);
    setChangelog(nextLog);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ sheet: next, changelog: nextLog }));
    } catch {
      // ignore
    }
    setSaveMessage("Reset to last saved copy.");
  }

  function clearLog() {
    setChangelog([]);
    pushLog("Change log cleared.");
  }

  function inferredSavingThrow(key: string) {
    const mod = Number.parseInt(formatModifier(sheet.abilityScores?.[key]?.score, sheet.abilityScores?.[key]?.modifier).replace("+", ""), 10) || 0;
    const proficient = sheet.savingThrowProficiencies?.[key] === "true";
    const total = mod + (proficient ? proficiencyBonus : 0);
    return `${total >= 0 ? "+" : ""}${total}`;
  }

  function inferredSkillBonus(skillName: string, ability: string) {
    const explicit = explicitSkillBonuses.get(skillName.toLowerCase());
    if (explicit) return explicit;
    const mod = Number.parseInt(
      formatModifier(sheet.abilityScores?.[ability]?.score, sheet.abilityScores?.[ability]?.modifier).replace("+", ""),
      10
    ) || 0;
    return `${mod >= 0 ? "+" : ""}${mod}`;
  }

  function updateEquipmentLine(index: number, value: string) {
    const nextLines = [...equipmentLines];
    nextLines[index] = value;
    updateText("equipment", textFromLines(nextLines));
  }

  function commitAttackRows(rows: Array<{ name: string; bonus: string; damage: string }>) {
    const text = rows
      .map((row) => [row.name.trim(), row.bonus.trim(), row.damage.trim()].filter(Boolean).join(" — "))
      .filter(Boolean)
      .join("\n");
    updateText("attacks", text);
  }

  function updateAttackRow(index: number, field: "name" | "bonus" | "damage", value: string) {
    const nextRows = [...attackRows];
    nextRows[index] = {
      ...(nextRows[index] ?? { name: "", bonus: "", damage: "" }),
      [field]: value,
    };
    commitAttackRows(nextRows);
  }

  function addAttackRow() {
    commitAttackRows([...attackRows, { name: "New attack", bonus: "", damage: "" }]);
  }

  function removeAttackRow(index: number) {
    commitAttackRows(attackRows.filter((_, rowIndex) => rowIndex !== index));
  }

  function commitFeatureBlocks(blocks: Array<{ title: string; details: string; quick?: boolean }>) {
    const text = blocks
      .map((block) => {
        const headline = `${block.quick ? "[Quick] " : ""}${block.title.trim()}`.trim();
        return [headline, block.details.trim()].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n");
    updateText("featuresTraits", text);
  }

  function updateFeatureBlock(index: number, field: "title" | "details" | "quick", value: string | boolean) {
    const nextBlocks = [...featureBlocks];
    nextBlocks[index] = {
      ...(nextBlocks[index] ?? { title: "", details: "", quick: false }),
      [field]: value,
    };
    commitFeatureBlocks(nextBlocks as Array<{ title: string; details: string; quick?: boolean }>);
  }

  function addFeatureBlock() {
    commitFeatureBlocks([...featureBlocks, { title: "New feature", details: "", quick: false }]);
  }

  function removeFeatureBlock(index: number) {
    commitFeatureBlocks(featureBlocks.filter((_, blockIndex) => blockIndex !== index));
  }

  function addEquipmentLine() {
    const nextLines = [...equipmentLines, "New item"];
    setSheet((prev) => ({ ...prev, equipment: textFromLines(nextLines) }));
    pushLog("Equipment: added item.");
  }

  function removeEquipmentLine(index: number) {
    const removed = equipmentLines[index];
    if (!removed) return;
    const nextLines = equipmentLines.filter((_, itemIndex) => itemIndex !== index);
    setSheet((prev) => ({ ...prev, equipment: textFromLines(nextLines) }));
    setUndoEquipment({ item: removed, index });
    pushLog(`Equipment: removed ${removed}.`);
  }

  function undoRemoveEquipment() {
    if (!undoEquipment) return;
    const nextLines = [...equipmentLines];
    nextLines.splice(undoEquipment.index, 0, undoEquipment.item);
    setSheet((prev) => ({ ...prev, equipment: textFromLines(nextLines) }));
    pushLog(`Equipment: restored ${undoEquipment.item}.`);
    setUndoEquipment(null);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-amber-950/65">{saveMessage}</div>
        <button
          type="button"
          onClick={resetSheet}
          className="rounded-lg border border-amber-950/15 bg-[#fff9ea] px-3 py-2 text-sm text-amber-950 transition hover:bg-white"
        >
          Reset to saved
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              activeTab === tab
                ? "border-amber-900/25 bg-[#f6ead0] font-semibold text-amber-950 shadow-[0_6px_16px_rgba(80,49,12,0.08)]"
                : "border-amber-950/10 bg-[#fff9ea] text-amber-950/70 hover:bg-white"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className={sectionClass}>
            <SectionTitle title="Identity" subtitle="Core details, appearance, and presentation." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Character Name" value={sheet.basics?.characterName ?? ""} onChange={(v) => updateBasics("characterName", v)} />
              <Field label="Class / Level" value={sheet.basics?.classLevel ?? ""} onChange={(v) => updateBasics("classLevel", v)} />
              <Field label="Background" value={sheet.basics?.background ?? ""} onChange={(v) => updateBasics("background", v)} />
              <Field label="Race" value={sheet.basics?.race ?? ""} onChange={(v) => updateBasics("race", v)} />
              <Field label="Alignment" value={sheet.basics?.alignment ?? ""} onChange={(v) => updateBasics("alignment", v)} />
              <StepField label="Age" value={sheet.basics?.age ?? ""} onChange={(v) => updateBasics("age", v)} min={0} />
              <Field label="Height" value={sheet.basics?.height ?? ""} onChange={(v) => updateBasics("height", v)} />
              <Field label="Weight" value={sheet.basics?.weight ?? ""} onChange={(v) => updateBasics("weight", v)} />
              <Field label="Eyes" value={sheet.basics?.eyes ?? ""} onChange={(v) => updateBasics("eyes", v)} />
              <Field label="Hair" value={sheet.basics?.hair ?? ""} onChange={(v) => updateBasics("hair", v)} />
              <Field label="Skin" value={sheet.basics?.skin ?? ""} onChange={(v) => updateBasics("skin", v)} />
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Combat Record" subtitle="Live numbers you change mid-session." />
            <div className="grid gap-4 sm:grid-cols-2">
              <StepField label="Armor Class" value={sheet.coreStats?.armorClass ?? ""} onChange={(v) => updateCoreStats("armorClass", v)} min={0} />
              <Field label="Initiative" value={sheet.coreStats?.initiative ?? ""} onChange={(v) => updateCoreStats("initiative", v)} />
              <StepField label="Current HP" value={sheet.coreStats?.currentHp ?? ""} onChange={(v) => updateCoreStats("currentHp", v)} min={0} />
              <StepField label="Max HP" value={sheet.coreStats?.maxHp ?? ""} onChange={(v) => updateCoreStats("maxHp", v)} min={0} />
              <Field label="Speed" value={sheet.coreStats?.speed ?? ""} onChange={(v) => updateCoreStats("speed", v)} />
              <Field label="Hit Dice" value={sheet.coreStats?.hitDice ?? ""} onChange={(v) => updateCoreStats("hitDice", v)} />
              <Field label="Proficiency Bonus" value={sheet.coreStats?.proficiencyBonus ?? ""} onChange={(v) => updateCoreStats("proficiencyBonus", v)} />
              <StepField
                label="Passive Perception"
                value={sheet.coreStats?.passivePerception ?? ""}
                onChange={(v) => updateCoreStats("passivePerception", v)}
                min={0}
              />
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "stats" ? (
        <>
          <section className={sectionClass}>
            <SectionTitle title="Combat Snapshot" subtitle="The numbers you look for mid-turn." />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SnapshotCard label="AC" value={sheet.coreStats?.armorClass ?? ""} />
              <SnapshotHpEditor
                current={sheet.coreStats?.currentHp ?? ""}
                max={sheet.coreStats?.maxHp ?? ""}
                onCurrentChange={(value) => updateCoreStats("currentHp", value)}
                onMaxChange={(value) => updateCoreStats("maxHp", value)}
              />
              <SnapshotCard label="Initiative" value={sheet.coreStats?.initiative ?? ""} />
              <SnapshotCard label="Speed" value={sheet.coreStats?.speed ?? ""} />
              <SnapshotCard label="Spell Save DC" value={spellSaveDc} />
              <SnapshotCard label="Spell Attack" value={spellAttackBonus} />
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Ability Scores" subtitle="Modifiers and saving throws are inferred from the score and proficiency toggle." />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ABILITY_LABELS.map(({ key, label }) => (
                <div
                  key={key}
                  className={`${panelClass} ${primaryAbility === key ? "ring-1 ring-amber-800/30 shadow-[0_0_0_1px_rgba(146,100,34,0.08)]" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="font-serif text-sm font-semibold tracking-[0.08em] text-amber-950/75">
                      {label.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="font-serif text-lg font-semibold text-amber-950">
                      {formatModifier(sheet.abilityScores?.[key]?.score, sheet.abilityScores?.[key]?.modifier)}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[0.95fr_1.05fr]">
                    <StepField label="Score" value={sheet.abilityScores?.[key]?.score ?? ""} onChange={(v) => updateAbility(key, "score", v)} min={0} />
                    <Field label="Save" value={inferredSavingThrow(key)} onChange={() => {}} readOnly />
                  </div>
                  <div className="mt-3">
                    <Toggle label="Save Proficient" checked={sheet.savingThrowProficiencies?.[key] === "true"} onChange={(checked) => updateSavingThrowProficiency(key, checked)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_1.2fr]">
            <section className={sectionClass}>
              <SectionTitle title="Saving Throws and Skills" subtitle="Compact gameplay reference with aligned modifiers and proficiency markers." />
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Saving Throws</div>
                  {ABILITY_LABELS.map(({ key, label }) => (
                    <div key={`save-${key}`} className="grid grid-cols-[0.7rem_3rem_1fr] items-center gap-3 rounded-xl border border-amber-950/10 bg-[#fff9ea] px-3 py-2.5">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${sheet.savingThrowProficiencies?.[key] === "true" ? "bg-amber-700" : "border border-amber-950/30 bg-transparent"}`} />
                      <span className="text-sm font-semibold tabular-nums text-amber-950">{inferredSavingThrow(key)}</span>
                      <span className="text-sm text-amber-950/82">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Skills</div>
                  <div className="space-y-2">
                    {ALL_SKILLS.map((skill) => (
                      <div key={skill.name} className="grid grid-cols-[0.7rem_3rem_minmax(0,1fr)_2.3rem] items-center gap-3 rounded-xl border border-amber-950/10 bg-[#fff9ea] px-3 py-2.5">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${explicitSkillBonuses.has(skill.name.toLowerCase()) ? "bg-amber-700" : "border border-amber-950/30 bg-transparent"}`} />
                        <span className="text-sm font-semibold tabular-nums text-amber-950">{inferredSkillBonus(skill.name, skill.ability)}</span>
                        <span className="text-sm text-amber-950/82">{skill.name}</span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-950/46">
                          {ABILITY_LABELS.find((item) => item.key === skill.ability)?.label.slice(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionTitle title="Proficiencies" subtitle="Enter one item per line. Skill bonuses should use the format Skill Name (+X)." />
              <div className="space-y-4">
                <TextBlock label="Skill Bonuses" value={sheet.skills ?? ""} onChange={(v) => updateText("skills", v)} rows={6} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextBlock label="Tool Proficiencies" value={sheet.toolProficiencies ?? ""} onChange={(v) => updateText("toolProficiencies", v)} rows={4} />
                  <TextBlock label="Languages" value={sheet.languages ?? ""} onChange={(v) => updateText("languages", v)} rows={4} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextBlock label="Weapon Proficiencies" value={sheet.weaponProficiencies ?? ""} onChange={(v) => updateText("weaponProficiencies", v)} rows={4} />
                  <TextBlock label="Armor Proficiencies" value={sheet.armorProficiencies ?? ""} onChange={(v) => updateText("armorProficiencies", v)} rows={4} />
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}

      {activeTab === "combat" ? (
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <section className={sectionClass}>
            <SectionTitle title="Attacks and Features" subtitle="Session-facing actions, class features, and combat notes." />
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SnapshotCard label="AC" value={sheet.coreStats?.armorClass ?? ""} />
              <SnapshotHpEditor
                current={sheet.coreStats?.currentHp ?? ""}
                max={sheet.coreStats?.maxHp ?? ""}
                onCurrentChange={(value) => updateCoreStats("currentHp", value)}
                onMaxChange={(value) => updateCoreStats("maxHp", value)}
              />
              <SnapshotCard label="Initiative" value={sheet.coreStats?.initiative ?? ""} />
              <SnapshotCard label="Speed" value={sheet.coreStats?.speed ?? ""} />
              <SnapshotCard label="Spell Save DC" value={spellSaveDc} />
              <SnapshotCard label="Spell Attack" value={spellAttackBonus} />
            </div>
            {quickActionTrackers.length ? (
              <div className="mb-4 rounded-2xl border border-amber-950/14 bg-[#fff4dc] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Quick Actions</div>
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  {quickActionTrackers.slice(0, 6).map((feature) => (
                    <div key={feature.trackerKey} className={`rounded-xl border border-amber-950/10 bg-[#fff8e6] px-3 py-3 ${feature.maxUses > 0 ? "lg:col-span-2" : ""}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-amber-950">{feature.title}</div>
                          {feature.details ? <div className="mt-1 whitespace-pre-line text-sm leading-6 text-amber-950/72">{feature.details}</div> : null}
                        </div>
                        {feature.maxUses > 0 ? (
                          <div className="min-w-[220px]">
                            <StepField
                              label="Remaining Uses"
                              value={String(feature.remaining)}
                              onChange={(value) => {
                                const next = parseCount(value);
                                const clamped = Math.min(feature.maxUses, Math.max(0, next));
                                updateCoreStats(feature.trackerKey, String(clamped));
                              }}
                              min={0}
                            />
                          </div>
                        ) : null}
                      </div>
                      {feature.maxUses > 0 ? (
                        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-950/45">
                          {feature.remaining} of {feature.maxUses} remaining
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="space-y-4">
              <div className={panelClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-serif text-lg font-semibold">Attacks</div>
                    <div className="text-sm text-amber-950/65">Structured attack rows are easier to scan in combat than one long text block.</div>
                  </div>
                  <button type="button" onClick={addAttackRow} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 hover:bg-white">
                    Add attack
                  </button>
                </div>
                <div className="space-y-3">
                  {attackRows.length ? (
                    attackRows.map((row, index) => (
                      <div key={`attack-${index}`} className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] p-3">
                        <div className="grid gap-2 md:grid-cols-[1.15fr_0.8fr_1.3fr_1.3fr]">
                          <Field label="Name" value={row.name} onChange={(value) => updateAttackRow(index, "name", value)} />
                          <Field label="To Hit" value={row.bonus} onChange={(value) => updateAttackRow(index, "bonus", value)} />
                          <Field label="Damage" value={row.damage.split("—")[0]?.trim() ?? row.damage} onChange={(value) => updateAttackRow(index, "damage", `${value}${row.damage.includes("—") ? ` — ${row.damage.split("—").slice(1).join("—").trim()}` : ""}`)} />
                          <Field label="Notes" value={row.damage.includes("—") ? row.damage.split("—").slice(1).join("—").trim() : ""} onChange={(value) => {
                            const baseDamage = row.damage.split("—")[0]?.trim() ?? "";
                            updateAttackRow(index, "damage", value ? `${baseDamage} — ${value}` : baseDamage);
                          }} />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button type="button" onClick={() => removeAttackRow(index)} className="rounded-lg border border-amber-950/10 px-3 py-1.5 text-sm text-amber-950/65 hover:bg-white hover:text-amber-950">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-950/20 bg-[#fffdf6] px-4 py-5 text-sm text-amber-950/65">
                      No attacks listed yet.
                    </div>
                  )}
                </div>
              </div>

              <div className={panelClass}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-serif text-lg font-semibold">Features and Traits</div>
                    <div className="text-sm text-amber-950/65">Each feature gets its own card so active rules stay readable at the table.</div>
                  </div>
                  <button type="button" onClick={addFeatureBlock} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 hover:bg-white">
                    Add feature
                  </button>
                </div>
                <div className="space-y-3">
                  {featureBlocks.length ? (
                    featureBlocks.map((block, index) => (
                      <div key={`feature-${index}`} className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="w-full">
                            <Field label="Feature" value={block.title} onChange={(value) => updateFeatureBlock(index, "title", value)} />
                          </div>
                          <button type="button" onClick={() => removeFeatureBlock(index)} className="rounded-lg border border-amber-950/10 px-3 py-2 text-sm text-amber-950/65 hover:bg-white hover:text-amber-950">
                            Remove
                          </button>
                        </div>
                        <div className="mb-3">
                          <Toggle label="Quick Action" checked={Boolean(block.quick)} onChange={(checked) => updateFeatureBlock(index, "quick", checked)} />
                        </div>
                        <TextBlock label="Details" value={block.details} onChange={(value) => updateFeatureBlock(index, "details", value)} rows={5} />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-950/20 bg-[#fffdf6] px-4 py-5 text-sm text-amber-950/65">
                      No features listed yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Equipment" subtitle="Track important carried gear with add/remove and undo support." />
            {keyItems.length ? (
              <div className="mb-4 rounded-2xl border border-amber-950/15 bg-[#fff4dc] px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/60">Key Items</div>
                <div className="mt-2 space-y-2">
                  {keyItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-amber-950/12 bg-[#fff8e6] px-4 py-3">
                      <div className="flex items-start gap-3">
                        <span className="pt-0.5 text-amber-800">◆</span>
                        <div className="min-w-0">
                          <Link href={`/items/${item.id}`} className="text-sm font-semibold tracking-tight hover:underline">
                            {item.title}
                          </Link>
                          <div className="mt-1 text-sm text-amber-950/78">{item.summary}</div>
                          <div className="mt-1 text-xs text-amber-950/55">
                            {item.category} · {item.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {undoEquipment ? (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-950/15 bg-[#fff4dc] px-4 py-3 text-sm text-amber-950/80">
                <span>Removed {undoEquipment.item}</span>
                <button type="button" onClick={undoRemoveEquipment} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-3 py-1.5 text-sm text-amber-950 hover:bg-white">
                  Undo
                </button>
              </div>
            ) : null}
            <div className="space-y-3">
              {equipmentLines.length ? (
                equipmentLines.map((item, index) => (
                  <div key={`${index}-${item}`} className="flex items-center gap-3 rounded-2xl border border-amber-950/15 bg-[#fff9ea] px-3 py-3">
                    <span className="text-amber-800">◆</span>
                    <input
                      value={item}
                      onChange={(e) => updateEquipmentLine(index, e.target.value)}
                      className="w-full bg-transparent text-sm text-amber-950 outline-none"
                    />
                    <button type="button" onClick={() => removeEquipmentLine(index)} className="rounded-lg border border-amber-950/10 px-2 py-1 text-sm text-amber-950/65 hover:bg-white hover:text-amber-950">
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-950/20 bg-[#fff9ea] px-4 py-5 text-sm text-amber-950/65">
                  No equipment listed yet.
                </div>
              )}
            </div>
            <button type="button" onClick={addEquipmentLine} className="mt-4 rounded-lg border border-amber-950/15 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 hover:bg-white">
              Add item
            </button>
          </section>
        </div>
      ) : null}

      {activeTab === "magic" ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className={sectionClass}>
            <SectionTitle title="Spellbook" subtitle="Core spellcasting numbers first, slots immediately below." />
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <SnapshotCard label="Spell Save DC" value={spellSaveDc} />
              <SnapshotCard label="Spell Attack" value={spellAttackBonus} />
              <SnapshotCard label="Proficiency" value={sheet.coreStats?.proficiencyBonus ?? ""} />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((level) => {
                const current = parseCount(sheet.spellSlots?.[`level${level}Current`]);
                const max = parseCount(sheet.spellSlots?.[`level${level}Max`]);
                return (
                  <div key={`spell-${level}`} className={panelClass}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="font-serif text-base font-semibold">Level {level}</div>
                      <div className="text-sm text-amber-950/65">{current} / {max}</div>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {Array.from({ length: Math.max(max, 1) }).map((_, index) => (
                        <button
                          key={`slot-${level}-${index}`}
                          type="button"
                          onClick={() => updateSpellSlots(`level${level}Current`, String(index + 1 > current ? index + 1 : index))}
                          className={`h-7 w-7 rounded-full border transition ${index < current ? "border-amber-800 bg-amber-700/80" : "border-amber-950/20 bg-[#fffdf6] hover:bg-white"}`}
                          aria-label={`Toggle level ${level} slot ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="mb-2 flex gap-2">
                      <button type="button" onClick={() => spendSpellSlot(level)} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-white">
                        Use 1
                      </button>
                      <button type="button" onClick={() => restoreSpellSlots(level)} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-white">
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <StepField label="Current" value={sheet.spellSlots?.[`level${level}Current`] ?? ""} onChange={(v) => updateSpellSlots(`level${level}Current`, v)} min={0} />
                      <StepField label="Max" value={sheet.spellSlots?.[`level${level}Max`] ?? ""} onChange={(v) => updateSpellSlots(`level${level}Max`, v)} min={0} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={sectionClass}>
            <SectionTitle title="Spell Notes" subtitle="Until you add structured spell entries, keep the live spellbook notes here." />
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Level 0</div>
                  <div className="mt-1 text-sm text-amber-950/72">Cantrips and at-will options</div>
                </div>
                <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Level 1</div>
                  <div className="mt-1 text-sm text-amber-950/72">Core combat and support spells</div>
                </div>
                <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Level 2</div>
                  <div className="mt-1 text-sm text-amber-950/72">Higher-impact options and utility</div>
                </div>
              </div>
              <TextBlock label="Spellbook Notes" value={sheet.notes ?? ""} onChange={(v) => updateText("notes", v)} rows={10} />
              <div className="rounded-2xl border border-amber-950/15 bg-[#fff9ea] px-4 py-4 text-sm leading-7 text-amber-950/75">
                <div className="font-semibold text-amber-950">Useful reminders</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Saving throws are inferred from the ability score and the save proficiency toggle.</li>
                  <li>Skill reference values use explicit bonuses first, then fall back to the governing ability modifier.</li>
                  <li>Spell slots are shared across devices once the website save succeeds.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "familiar" ? (
        <section className={sectionClass}>
          <SectionTitle title="Companion Panel" subtitle="A compact secondary sheet for active companions and bonded summons." />
          <div className="mb-4 max-w-sm">
            <Toggle label="Active Familiar" checked={familiarEnabled} onChange={(checked) => updateFamiliar("enabled", String(checked))} />
          </div>
          {familiarEnabled ? (
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[24px] border border-amber-950/18 bg-[#fff8e6] p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" value={familiarData.name} onChange={(value) => updateFamiliar("name", value)} />
                  <Field label="Type" value={familiarData.type} onChange={(value) => updateFamiliar("type", value)} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-amber-950/12 bg-[#fffdf6] p-3">
                    <StepField label="Armor Class" value={familiarData.armorClass} onChange={(value) => updateFamiliar("armorClass", value)} min={0} />
                  </div>
                  <div className="rounded-2xl border border-amber-950/12 bg-[#fffdf6] p-3">
                    <Field label="HP" value={familiarData.hp} onChange={(value) => updateFamiliar("hp", value)} />
                  </div>
                  <div className="rounded-2xl border border-amber-950/12 bg-[#fffdf6] p-3">
                    <Field label="Speed" value={familiarData.speed} onChange={(value) => updateFamiliar("speed", value)} />
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-950/12 bg-[#fffdf6] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Once per Long Rest</div>
                  <textarea
                    value={familiarData.specialTrait}
                    onChange={(e) => updateFamiliar("specialTrait", e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-amber-950/20 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 outline-none transition placeholder:text-amber-950/35 focus:border-amber-800/40 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className={panelClass}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Abilities</div>
                  <textarea
                    value={familiarData.abilities}
                    onChange={(e) => updateFamiliar("abilities", e.target.value)}
                    rows={8}
                    className="mt-2 w-full rounded-2xl border border-amber-950/20 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 outline-none transition placeholder:text-amber-950/35 focus:border-amber-800/40 focus:bg-white"
                  />
                </div>
                <div className={panelClass}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Notes</div>
                  {hasMooMooBond ? (
                    <div className="mb-3 rounded-2xl border border-amber-950/12 bg-[#fff8e6] px-4 py-3 text-sm leading-6 text-amber-950/74">
                      Cannot attack, cannot take the Help action in combat, cannot intentionally trigger traps, and vanishes harmlessly at 0 HP.
                    </div>
                  ) : null}
                  <textarea
                    value={familiarData.notes}
                    onChange={(e) => updateFamiliar("notes", e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-amber-950/20 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 outline-none transition placeholder:text-amber-950/35 focus:border-amber-800/40 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-950/20 bg-[#fff9ea] px-4 py-5 text-sm text-amber-950/65">
              No active familiar or companion panel is available for this character yet.
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "story" ? (
        <section className={sectionClass}>
          <SectionTitle title="Story and Notes" subtitle="More like a character card than a form: summary first, details below." />
          <div className="space-y-4">
            <div className="rounded-[24px] border border-amber-950/18 bg-[#fff8e6] p-4">
              <div className="font-serif text-2xl font-semibold text-amber-950">{sheet.basics?.characterName || "Unnamed Character"}</div>
              <div className="mt-1 text-sm text-amber-950/72">
                {[sheet.basics?.race, sheet.basics?.classLevel, sheet.basics?.alignment].filter(Boolean).join(" · ")}
              </div>
              <div className="mt-3 rounded-2xl border border-amber-950/10 bg-[#fffdf6] px-4 py-3 text-sm italic text-amber-950/78">
                {sheet.notes?.trim() || "No character tagline or active note recorded yet."}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[
                ["Age", sheet.basics?.age],
                ["Height", sheet.basics?.height],
                ["Weight", sheet.basics?.weight],
                ["Eyes", sheet.basics?.eyes],
                ["Hair", sheet.basics?.hair],
                ["Skin", sheet.basics?.skin],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">{label}</div>
                  <div className="mt-1 text-sm text-amber-950/82">{value || "—"}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Race</div>
                <div className="mt-1 text-sm text-amber-950/82">{sheet.basics?.race || "—"}</div>
              </div>
              <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Background</div>
                <div className="mt-1 text-sm text-amber-950/82">{sheet.basics?.background || "—"}</div>
              </div>
              <div className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950/55">Alignment</div>
                <div className="mt-1 text-sm text-amber-950/82">{sheet.basics?.alignment || "—"}</div>
              </div>
            </div>
            <TextBlock label="Backstory" value={sheet.backstory ?? ""} onChange={(v) => updateText("backstory", v)} rows={14} />
            <TextBlock label="Story Notes" value={sheet.notes ?? ""} onChange={(v) => updateText("notes", v)} rows={6} />
          </div>
        </section>
      ) : null}

      {activeTab === "log" ? (
        <section className={sectionClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-950/15 pb-2">
            <div>
              <div className="font-serif text-xl font-semibold tracking-[0.06em] text-amber-950">Change Log</div>
              <div className="mt-1 text-sm text-amber-950/65">Recent sheet changes saved with the character record.</div>
            </div>
            {changelog.length ? (
              <button type="button" onClick={clearLog} className="rounded-lg border border-amber-950/15 bg-[#fffdf6] px-3 py-2 text-sm text-amber-950 hover:bg-white">
                Clear log
              </button>
            ) : null}
          </div>
          {changelog.length ? (
            <div className="space-y-3">
              {changelog.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-amber-950/12 bg-[#fff9ea] px-4 py-3">
                  <div className="text-sm font-medium text-amber-950">{entry.description}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-amber-950/45">{new Date(entry.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-950/20 bg-[#fff9ea] px-4 py-5 text-sm text-amber-950/65">
              No logged changes yet.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
