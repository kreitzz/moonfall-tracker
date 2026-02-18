import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import LocationNoteCard from "@/components/LocationNoteCard";

export default function LocationsPage() {
  const campaign = getCampaign();
  const notes = [...(campaign.locations ?? [])];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Location Notes</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Notes from the places the party has visited.
        </p>
      </header>

      {notes.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <LocationNoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          No location notes yet.
        </div>
      )}

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
