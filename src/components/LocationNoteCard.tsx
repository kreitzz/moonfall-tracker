import Link from "next/link";
import { CampaignLocation } from "@/lib/campaign";

export default function LocationNoteCard({ note }: { note: CampaignLocation }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-black/60 dark:text-white/60">{note.act}</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">{note.title}</div>
        </div>
        {note.session ? (
          <span className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/60 dark:border-white/10 dark:text-white/60">
            Session {note.session}
          </span>
        ) : null}
      </div>

      <div className="mt-3 text-sm text-black/70 dark:text-white/70">{note.summary}</div>

      <div className="mt-4">
        <Link
          href={`/locations/${note.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
        >
          Open <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
