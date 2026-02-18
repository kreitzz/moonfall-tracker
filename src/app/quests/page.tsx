import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import QuestCard from "@/components/QuestCard";

export default function QuestsPage() {
  const campaign = getCampaign();
  const quests = [...(campaign.quests ?? [])];
  const main = quests.filter((q) => q.tier === "main");
  const personal = quests.filter((q) => q.tier === "personal");
  const side = quests.filter((q) => q.tier === "side");

  const activeMain = main.filter((q) => q.status !== "complete");
  const completeMain = main.filter((q) => q.status === "complete");
  const activePersonal = personal.filter((q) => q.status !== "complete");
  const completePersonal = personal.filter((q) => q.status === "complete");
  const activeSide = side.filter((q) => q.status !== "complete");
  const completeSide = side.filter((q) => q.status === "complete");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Quest Board</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Main objectives, personal goals, and side threads.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Main Quests</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Active</div>
            {activeMain.length ? (
              <div className="space-y-4">
                {activeMain.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No active main quests yet.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Completed</div>
            {completeMain.length ? (
              <div className="space-y-4">
                {completeMain.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No completed main quests yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Personal Quests</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Active</div>
            {activePersonal.length ? (
              <div className="space-y-4">
                {activePersonal.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No active personal quests yet.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Completed</div>
            {completePersonal.length ? (
              <div className="space-y-4">
                {completePersonal.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No completed personal quests yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Side Quests</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Active</div>
            {activeSide.length ? (
              <div className="space-y-4">
                {activeSide.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No active side quests yet.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">Completed</div>
            {completeSide.length ? (
              <div className="space-y-4">
                {completeSide.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                No completed side quests yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
