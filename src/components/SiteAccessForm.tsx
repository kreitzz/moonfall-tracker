"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SiteAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Access denied.");

      const requested = searchParams.get("next") || "/";
      const destination = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
      router.replace(destination);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access denied.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md overflow-hidden rounded-3xl border border-amber-500/25 bg-white shadow-xl dark:bg-zinc-950">
      <div className="border-b border-black/10 bg-gradient-to-br from-amber-500/20 via-transparent to-violet-500/10 p-7 text-center dark:border-white/10">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Ascendaria</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">The road is warded.</h1>
        <p className="mt-2 text-sm text-black/65 dark:text-white/65">Speak the campaign password to enter.</p>
      </div>
      <div className="space-y-4 p-7">
        <label className="block text-sm font-medium">
          Password
          <input
            autoFocus
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-white/10"
          />
        </label>
        {error ? <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</div> : null}
        <button disabled={loading || !password} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50">
          {loading ? "Opening the way…" : "Enter Ascendaria"}
        </button>
      </div>
    </form>
  );
}

