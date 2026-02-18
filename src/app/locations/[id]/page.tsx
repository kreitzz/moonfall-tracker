import { notFound } from "next/navigation";
import Link from "next/link";
import { findLocationById } from "@/lib/campaign";
import { parseBlocks, renderBlocks } from "@/lib/textBlocks";

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = findLocationById(id);
  if (!location) return notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">{location.act}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{location.title}</h1>
        {location.summary ? <div className="text-black/70 dark:text-white/70">{location.summary}</div> : null}
        <div className="text-sm text-black/60 dark:text-white/60">
          <Link href="/locations" className="hover:underline">
            ← Back to location notes
          </Link>
        </div>
      </header>

      {location.content ? (
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="prose max-w-none text-black dark:text-white">
            {renderBlocks(parseBlocks(location.content))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
