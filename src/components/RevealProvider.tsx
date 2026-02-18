"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCampaign } from "@/lib/campaign";

type RevealContextValue = {
  isPublic: (id: string) => boolean;
  setPublic: (id: string, value: boolean) => void;
  listPublicIds: () => string[];
  exportCode: () => string;
  importCode: (code: string) => { ok: boolean; error?: string };
};

const RevealContext = createContext<RevealContextValue | null>(null);

const STORAGE_KEY = "moonfall.publicIds";

function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function encodeBase64Utf8(s: string): string {
  // btoa expects Latin1; convert safely.
  return btoa(unescape(encodeURIComponent(s)));
}

function decodeBase64Utf8(s: string): string {
  return decodeURIComponent(escape(atob(s)));
}

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const campaign = getCampaign();
  const initial = (campaign.meta as any).initialPublic as string[] | undefined;

  const [publicIds, setPublicIds] = useState<Set<string>>(new Set(initial ?? []));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = safeParseJson<string[]>(raw);
      if (!arr) return;
      const merged = new Set([...(initial ?? []), ...arr]);
      setPublicIds(merged);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<RevealContextValue>(() => {
    const persist = (next: Set<string>) => {
      setPublicIds(new Set(next));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
    };

    return {
      isPublic: (id: string) => publicIds.has(id),
      setPublic: (id: string, v: boolean) => {
        const next = new Set(publicIds);
        if (v) next.add(id);
        else next.delete(id);
        persist(next);
      },
      listPublicIds: () => Array.from(publicIds).sort(),
      exportCode: () => {
        const payload = { v: 1, publicIds: Array.from(publicIds).sort() };
        return encodeBase64Utf8(JSON.stringify(payload));
      },
      importCode: (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return { ok: false, error: "Empty code." };
        try {
          const json = decodeBase64Utf8(trimmed);
          const payload = safeParseJson<{ v: number; publicIds: string[] }>(json);
          if (!payload || !Array.isArray(payload.publicIds)) {
            return { ok: false, error: "Invalid code." };
          }
          const merged = new Set([...(initial ?? []), ...payload.publicIds]);
          persist(merged);
          return { ok: true };
        } catch {
          return { ok: false, error: "Could not decode code." };
        }
      },
    };
  }, [publicIds, initial]);

  return <RevealContext.Provider value={value}>{children}</RevealContext.Provider>;
}

export function useReveals() {
  const ctx = useContext(RevealContext);
  if (!ctx) throw new Error("useReveals must be used inside RevealProvider");
  return ctx;
}
