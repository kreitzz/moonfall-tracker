import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import QuestCard from "@/components/QuestCard";

export default function SideQuestsPage() {
  const campaign = getCampaign();
  const sideQuests = (campaign.quests ?? []).filter((q) => q.tier === "side");
  const isComplete = (status?: string) => status === "complete" || status === "completed";
  const active = sideQuests.filter((q) => !isComplete(q.status));
  const complete = sideQuests.filter((q) => isComplete(q.status));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Side Quests</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Optional threads, favors, and side objectives.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Active</div>
          {active.length ? (
            <div className="space-y-4">
              {active.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              No side quests yet.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Completed</div>
          {complete.length ? (
            <div className="space-y-4">
              {complete.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              No completed side quests yet.
            </div>
          )}
        </section>
      </div>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
