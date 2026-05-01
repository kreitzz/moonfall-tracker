import Link from "next/link";
import Image from "next/image";
import { getCampaign, PartyMember } from "@/lib/campaign";

function slugify(name: string) {
  return (name || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PartyCard({ member }: { member: PartyMember }) {
  if (!member?.name) return null;
  const slug = slugify(member.name);
  const campaign = getCampaign();
  const keyItems = (campaign.items ?? []).filter((item) => item.holder === member.name);
  const inactive = member.active === false;
  const deceased = inactive && /dead|deceased/i.test(`${member.role} ${member.editableSheet?.notes ?? ""}`);
  const badge = inactive ? (member.guest ? "Inactive Guest" : "Inactive PC") : member.guest ? "Guest" : "PC";

  return (
    <Link
      href={`/party/${slug}`}
      className={`group block rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-950 ${
        inactive ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/5">
            {member.image ? (
              <Image src={member.image} alt={member.name} fill className="object-contain" sizes="48px" />
            ) : null}
            {deceased ? (
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute left-1/2 top-1/2 h-[140%] w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-600 shadow-sm" />
                <div className="absolute left-1/2 top-1/2 h-[140%] w-1.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-600 shadow-sm" />
              </div>
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
          {badge}
        </span>
      </div>
      <div className="mt-3 text-sm text-black/70 dark:text-white/70">{member.role}</div>
      <div className="mt-2 text-sm text-black/70 dark:text-white/70">
        <span className="font-medium">Key Items:</span>{" "}
        {keyItems.length ? keyItems.slice(0, 3).map((item) => item.title).join(", ") : "None assigned"}
      </div>
      <div className="mt-3 text-xs text-black/50 dark:text-white/50">Click for details →</div>
    </Link>
  );
}
