import { CampaignQuest } from "@/lib/campaign";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function QuestCard({ quest }: { quest: CampaignQuest }) {
  const statusLabel = quest.status === "complete" ? "Completed" : "Active";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-black/60 dark:text-white/60">Quest</div>
          <div className="mt-0.5 text-base font-semibold tracking-tight">{quest.title}</div>
          {quest.summary ? (
            <div className="mt-2 text-sm text-black/70 dark:text-white/70">{quest.summary}</div>
          ) : null}
        </div>
        <span
          className={classNames(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            quest.status === "complete"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70"
          )}
        >
          {statusLabel}
        </span>
      </div>

      {quest.steps?.length ? (
        <div className="mt-4 space-y-2">
          {quest.steps.map((step, idx) => (
            <div key={`${quest.id}-step-${idx}`} className="flex items-start gap-2 text-sm">
              <span
                className={classNames(
                  "mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-[10px]",
                  step.done
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-black/20 text-black/50 dark:border-white/20 dark:text-white/50"
                )}
                aria-hidden
              >
                {step.done ? "✓" : "•"}
              </span>
              <div className={classNames(step.done ? "text-black/50 dark:text-white/50" : "text-black/80 dark:text-white/80")}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
