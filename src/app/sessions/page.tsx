import Link from "next/link";
import { getCampaign } from "@/lib/campaign";

export default function SessionsPage() {
  const campaign = getCampaign();
  const sessions = [...(campaign.sessions ?? [])].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Recaps, outcomes, and what happened “last time on…”
        </p>
      </header>

      <div className="grid gap-4">
        {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-black/60 dark:text-white/60">Session {s.number}</div>
                  <div className="mt-1 text-lg font-semibold tracking-tight">{s.title}</div>
                  <div className="mt-2 text-sm text-black/70 dark:text-white/70">{s.summary}</div>
                  {s.mvp ? (
                    <div className="mt-2 text-sm text-black/70 dark:text-white/70">
                      <span className="font-semibold">MVP:</span> {s.mvp.name} — {s.mvp.reason}
                    </div>
                  ) : null}
                  {s.lowlight ? (
                    <div className="mt-2 text-sm text-black/70 dark:text-white/70">
                      <span className="font-semibold">Critical Fail:</span> {s.lowlight.name} — {s.lowlight.reason}
                    </div>
                  ) : null}
                </div>
                <Link
                  href={`/sessions/${s.id}`}
                  className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black md:mt-0"
                >
                Open <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
