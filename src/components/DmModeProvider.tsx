"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type DmModeContextValue = {
  dmMode: boolean;
  enableDmMode: (passphrase: string) => boolean;
  disableDmMode: () => void;
};

const DmModeContext = createContext<DmModeContextValue | null>(null);

const STORAGE_KEY = "moonfall.dmMode";
const PASS_KEY = "moonfall.dmPassphrase";

// Default passphrase. Change in UI anytime; this is intentionally lightweight.
const DEFAULT_PASSPHRASE = "sires69420";

export function DmModeProvider({ children }: { children: React.ReactNode }) {
  const [dmMode, setDmMode] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setDmMode(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<DmModeContextValue>(() => {
    return {
      dmMode,
      enableDmMode: (passphrase: string) => {
        const correct = (localStorage.getItem(PASS_KEY) ?? DEFAULT_PASSPHRASE) === passphrase;
        if (!correct) return false;
        setDmMode(true);
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // ignore
        }
        return true;
      },
      disableDmMode: () => {
        setDmMode(false);
        try {
          localStorage.setItem(STORAGE_KEY, "false");
        } catch {
          // ignore
        }
      },
    };
  }, [dmMode]);

  return <DmModeContext.Provider value={value}>{children}</DmModeContext.Provider>;
}

export function useDmMode() {
  const ctx = useContext(DmModeContext);
  if (!ctx) throw new Error("useDmMode must be used inside DmModeProvider");
  return ctx;
}

export function setDmPassphrase(newPassphrase: string) {
  try {
    localStorage.setItem(PASS_KEY, newPassphrase);
  } catch {
    // ignore
  }
}
