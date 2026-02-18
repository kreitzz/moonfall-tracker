import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { findNpcById } from "@/lib/campaign";

// ✅ Next 16: params is async in dynamic routes
export default async function NpcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const npc = findNpcById(id);
  if (!npc) return notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">NPC</div>
        <h1 className="text-2xl font-semibold tracking-tight">{npc.name}</h1>
        <div className="text-black/70 dark:text-white/70">
          {npc.title} · {npc.status}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="relative aspect-square">
            {npc.image ? <Image src={npc.image} alt={npc.name} fill className="object-cover" unoptimized /> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="text-sm text-black/60 dark:text-white/60">Notes</div>
          <div className="mt-2 text-black/70 dark:text-white/70">{npc.summary}</div>

          {npc.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {npc.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-xs text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/npcs"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              ← Back to NPCs
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
