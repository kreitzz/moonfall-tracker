import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import { parseBlocks, renderBlocks } from "@/lib/textBlocks";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


// ✅ Next 16: params is async in dynamic routes
export default async function PartyMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const campaign = getCampaign();
  const member = campaign.party.find((m) => slugify(m.name) === slug);
  if (!member) return notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">
          Party · The Belligerent Five
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{member.name}</h1>
        <div className="text-black/70 dark:text-white/70">
          {member.ancestry} · {member.class}
        </div>
      </header>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
          <div className="text-sm text-black/60 dark:text-white/60">Role</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">{member.role}</div>

          {member.card ? (
            <div className="mt-6">
              <div className="prose max-w-none text-black dark:text-white">
                {renderBlocks(parseBlocks(member.card))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-black/70 dark:text-white/70">
              <p>
                This is a default character card. If you want, you can add:
                <span className="font-medium"> backstory, bonds, gear, notable moments</span>.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            >
              ← Back home
            </Link>
            <Link
              href="/sessions"
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              View sessions →
            </Link>
          </div>
          </div>

          <div className="w-full md:w-[360px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-black/[0.03] dark:bg-white/5">
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-contain"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
