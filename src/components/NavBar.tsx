"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useDmMode } from "@/components/DmModeProvider";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function NavBar({ partyName }: { partyName: string }) {
  const pathname = usePathname();
  const { dmMode, enableDmMode, disableDmMode } = useDmMode();
  const [showDmPrompt, setShowDmPrompt] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const links = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/players", label: "Players" },
      { href: "/sessions", label: "Sessions" },
      { href: "/quests", label: "Quests" },
      { href: "/locations", label: "Location Notes" },
      { href: "/npcs", label: "NPCs" },
      { href: "/battles", label: "Encounters" },
      { href: "/gallery", label: "Maps" },
      ...(dmMode ? [{ href: "/map-editor", label: "Map Editor" }] : []),
      { href: "/search", label: "Search" },
      ...(dmMode ? [{ href: "/docs", label: "DM Tools" }] : []),
      ...(dmMode ? [{ href: "/admin", label: "DM" }] : []),
    ],
    [dmMode]
  );

  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-base font-semibold tracking-tight">
            {partyName}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={classNames(
                    "rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => {
              if (dmMode) {
                disableDmMode();
                setErr(null);
              } else {
                setShowDmPrompt((s) => !s);
                setErr(null);
              }
            }}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-sm transition",
              dmMode
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-black/10 text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
            )}
          >
            {dmMode ? "DM Mode: ON" : "DM Mode"}
          </button>
        </div>
      </div>

      {showDmPrompt && !dmMode ? (
        <div className="border-t border-black/10 bg-white dark:border-white/10 dark:bg-black">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-black/70 dark:text-white/70">
              Enter passphrase to unlock DM Mode.
            </div>
            <div className="flex items-center gap-2">
              <input
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="passphrase"
                className="w-48 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20"
              />
              <button
                onClick={() => {
                  const ok = enableDmMode(pass);
                  if (!ok) setErr("Nope — wrong passphrase.");
                  else {
                    setErr(null);
                    setShowDmPrompt(false);
                    setPass("");
                  }
                }}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
              >
                Unlock
              </button>
              <button
                onClick={() => {
                  setShowDmPrompt(false);
                  setErr(null);
                }}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            {err ? <div className="text-sm text-red-600 dark:text-red-400">{err}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
