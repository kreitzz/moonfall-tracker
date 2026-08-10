"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useDmMode } from "@/components/DmModeProvider";
import { NYX_CHARACTER_BIBLE, type NyxAgentResponse, type NyxMessage, type NyxMode } from "@/lib/nyx-agent";

type SavedState = {
  mode: NyxMode;
  scene: string;
  privateDirection: string;
  goal: string;
  hp: string;
  spellSlots: string;
  conditions: string;
  relationships: Record<string, string>;
  memories: string[];
  history: NyxMessage[];
};

const STORAGE_KEY = "moonfall.nyxAgent.v2";
const RETIRED_STORAGE_KEYS = ["moonfall.nyxAgent.v1"];
const initial: SavedState = {
  mode: "conversation",
  scene: "",
  privateDirection: "",
  goal: "Help the party stop the dragons without becoming anyone's disposable weapon.",
  hp: "",
  spellSlots: "",
  conditions: "None",
  relationships: {
    Echo: "Competitive curiosity and visible flirtation; she currently treats him as an entertaining rival.",
    Mead: "Defensive around his morality, but curious whether he judges her or believes she can be better.",
    Prom: "Respects his honest strength and suspects she can relax around him without performing.",
    Heywud: "Underestimates him socially but is intrigued by his mind and becoming quietly protective.",
  },
  memories: [
    "Echo Mead defeated Nyx in the Guild Games final.",
    "Nyx offered to join the party's dragon hunt after surviving the attack on Lunaryth.",
  ],
  history: [],
};

export default function NyxAgent() {
  const { dmMode } = useDmMode();
  const [state, setState] = useState<SavedState>(initial);
  const [prompt, setPrompt] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [result, setResult] = useState<NyxAgentResponse | null>(null);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      RETIRED_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SavedState>;
        setState({
          ...initial,
          ...parsed,
          relationships: { ...initial.relationships, ...(parsed.relationships ?? {}) },
        });
      }
      setAccessCode(sessionStorage.getItem("moonfall.nyxAgent.accessCode") || "");
    } catch {
      // Use defaults if browser storage is unavailable or malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const update = <K extends keyof SavedState>(key: K, value: SavedState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  async function askNyx() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      sessionStorage.setItem("moonfall.nyxAgent.accessCode", accessCode);
      const response = await fetch("/api/nyx-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-nyx-agent-code": accessCode },
        body: JSON.stringify({ ...state, prompt }),
      });
      const body = (await response.json()) as NyxAgentResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "Nyx Agent could not respond.");
      setResult(body);
      const nyxText = [body.speech, body.action].filter(Boolean).join(" — ");
      setState((current) => ({
        ...current,
        history: [
          ...current.history,
          { role: "dm", text: prompt.trim() } satisfies NyxMessage,
          { role: "nyx", text: nyxText } satisfies NyxMessage,
        ].slice(-20),
      }));
      setPrompt("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nyx Agent could not respond.");
    } finally {
      setLoading(false);
    }
  }

  if (!dmMode) {
    return <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">Enable DM Mode to use Nyx Agent.</div>;
  }

  const field = "w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-white/10 dark:bg-white/5";

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Image src="/npcs/nyx-amberline-arena-champion.png" alt="Nyx Amberline" width={88} height={88} className="h-20 w-20 rounded-2xl object-cover object-top" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Nyx Agent</h1>
          <p className="text-black/65 dark:text-white/65">Nyx chooses her own words and intentions. You still resolve the world, rolls, and consequences.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <main className="space-y-4 rounded-2xl border border-black/10 p-4 dark:border-white/10">
          <div className="flex flex-wrap gap-2">
            {(["conversation", "combat", "downtime"] as NyxMode[]).map((mode) => (
              <button key={mode} onClick={() => update("mode", mode)} className={`rounded-full px-4 py-2 text-sm capitalize ${state.mode === mode ? "bg-amber-500 text-black" : "bg-black/5 dark:bg-white/10"}`}>{mode}</button>
            ))}
          </div>

          <label className="block text-sm font-medium">Current scene
            <textarea className={`${field} mt-1 min-h-24`} value={state.scene} onChange={(e) => update("scene", e.target.value)} placeholder="Where is Nyx, who is present, and what does she plainly know?" />
          </label>
          <label className="block text-sm font-medium">Private direction <span className="font-normal text-black/50 dark:text-white/50">(performance guidance, never spoken as knowledge)</span>
            <textarea className={`${field} mt-1 min-h-20`} value={state.privateDirection} onChange={(e) => update("privateDirection", e.target.value)} placeholder="Optional: suspicious of the offer; do not start a fight..." />
          </label>

          {state.history.length > 0 && (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl bg-black/[.03] p-3 dark:bg-white/[.04]">
              {state.history.map((message, index) => (
                <div key={`${index}-${message.role}`} className={`text-sm ${message.role === "nyx" ? "text-amber-700 dark:text-amber-300" : "text-black/70 dark:text-white/70"}`}>
                  <span className="font-semibold">{message.role === "nyx" ? "Nyx" : "Table"}:</span> {message.text}
                </div>
              ))}
            </div>
          )}

          <label className="block text-sm font-medium">What happens now?
            <textarea className={`${field} mt-1 min-h-24`} value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void askNyx(); }} placeholder={state.mode === "combat" ? "It is Nyx's turn. The dragon is 60 feet away..." : "Prom asks Nyx why she really volunteered..."} />
          </label>
          <button disabled={loading || !prompt.trim()} onClick={() => void askNyx()} className="rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-black disabled:opacity-50">
            {loading ? "Nyx is deciding…" : state.mode === "combat" ? "Take Nyx’s turn" : "Ask Nyx"}
          </button>
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}

          {result && (
            <section className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              {result.speech && <div><div className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Nyx says</div><p className="mt-1 text-lg">“{result.speech}”</p></div>}
              {result.action && <div><div className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Declared action</div><p>{result.action}</p></div>}
              {result.intent && <div><div className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Intent</div><p>{result.intent}</p></div>}
              {result.dmNote && <details><summary className="cursor-pointer text-sm font-semibold">DM note</summary><p className="mt-2 text-sm">{result.dmNote}</p></details>}
              {result.memorySuggestion && (
                <button onClick={() => { update("memories", [...state.memories, result.memorySuggestion]); setResult({ ...result, memorySuggestion: "" }); }} className="rounded-lg border border-amber-700/30 px-3 py-2 text-sm font-medium">Approve memory: {result.memorySuggestion}</button>
              )}
            </section>
          )}
        </main>

        <aside className="space-y-4">
          <details className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <summary className="cursor-pointer font-semibold">Nyx character bible</summary>
            <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-relaxed text-black/75 dark:text-white/75">{NYX_CHARACTER_BIBLE}</div>
          </details>

          <section className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <h2 className="font-semibold">Nyx right now</h2>
            <label className="block text-sm">Current goal<input className={`${field} mt-1`} value={state.goal} onChange={(e) => update("goal", e.target.value)} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">HP<input className={`${field} mt-1`} value={state.hp} onChange={(e) => update("hp", e.target.value)} placeholder="38 / 52" /></label>
              <label className="block text-sm">Spell slots<input className={`${field} mt-1`} value={state.spellSlots} onChange={(e) => update("spellSlots", e.target.value)} placeholder="2 / 2" /></label>
            </div>
            <label className="block text-sm">Conditions<input className={`${field} mt-1`} value={state.conditions} onChange={(e) => update("conditions", e.target.value)} /></label>
          </section>

          <section className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <div>
              <h2 className="font-semibold">Relationships</h2>
              <p className="text-xs text-black/55 dark:text-white/55">Update these after meaningful scenes. The agent uses them to evolve each bond.</p>
            </div>
            {Object.entries(state.relationships).map(([name, note]) => (
              <label key={name} className="block text-sm font-medium">{name}
                <textarea
                  className={`${field} mt-1 min-h-20`}
                  value={note}
                  onChange={(e) => update("relationships", { ...state.relationships, [name]: e.target.value })}
                />
              </label>
            ))}
          </section>

          <section className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <h2 className="font-semibold">Approved memory</h2>
            <p className="text-xs text-black/55 dark:text-white/55">Only facts in this ledger carry into later scenes.</p>
            <ul className="space-y-2">
              {state.memories.map((memory, index) => <li key={`${memory}-${index}`} className="flex gap-2 rounded-lg bg-black/[.04] p-2 text-sm dark:bg-white/[.06]"><span className="flex-1">{memory}</span><button aria-label="Remove memory" onClick={() => update("memories", state.memories.filter((_, i) => i !== index))} className="text-black/40 hover:text-red-500 dark:text-white/40">×</button></li>)}
            </ul>
            <div className="flex gap-2"><input className={field} value={memoryDraft} onChange={(e) => setMemoryDraft(e.target.value)} placeholder="Add a fact Nyx learned" /><button onClick={() => { if (memoryDraft.trim()) { update("memories", [...state.memories, memoryDraft.trim()]); setMemoryDraft(""); } }} className="rounded-lg border border-black/10 px-3 dark:border-white/10">Add</button></div>
          </section>

          <section className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
            <h2 className="font-semibold">Server access</h2>
            <label className="block text-sm">Agent access code<input type="password" autoComplete="off" className={`${field} mt-1`} value={accessCode} onChange={(e) => setAccessCode(e.target.value)} /></label>
            <p className="text-xs text-black/55 dark:text-white/55">Kept in this browser tab only. Match it to NYX_AGENT_ACCESS_CODE on the server.</p>
          </section>

          <button onClick={() => { if (window.confirm("Clear Nyx's conversation history? Her approved memories will remain.")) update("history", []); }} className="text-sm text-black/50 underline dark:text-white/50">Clear conversation history</button>
        </aside>
      </div>
    </div>
  );
}
