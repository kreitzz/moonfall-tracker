import Link from "next/link";
import Image from "next/image";
import { PartyMember } from "@/lib/campaign";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PartyCard({ member }: { member: PartyMember }) {
  const slug = slugify(member.name);

  return (
    <Link
      href={`/party/${slug}`}
      className="group block rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
            {member.image ? (
              <Image src={member.image} alt={member.name} fill className="object-cover" sizes="48px" />
            ) : null}
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight group-hover:underline">{member.name}</div>
            <div className="mt-1 text-sm text-black/70 dark:text-white/70">
              {member.ancestry} · {member.class}
            </div>
          </div>
        </div>

        <span className="rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/60 dark:border-white/10 dark:text-white/60">
          PC
        </span>
      </div>
      <div className="mt-3 text-sm text-black/70 dark:text-white/70">{member.role}</div>
      <div className="mt-3 text-xs text-black/50 dark:text-white/50">Click for details →</div>
    </Link>
  );
}
