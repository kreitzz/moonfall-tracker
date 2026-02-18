"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CampaignImage } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";
import { useReveals } from "@/components/RevealProvider";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function MapsGallery({ images }: { images: CampaignImage[] }) {
  const { dmMode } = useDmMode();
  const { isPublic, setPublic } = useReveals();

  const [act, setAct] = useState<string>("all");
  const acts = useMemo(() => Array.from(new Set(images.map((i) => i.act))).sort(), [images]);

  const filtered = useMemo(() => {
    return images
      .filter((i) => (act === "all" ? true : i.act === act))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [images, act]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <select
            value={act}
            onChange={(e) => setAct(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
          >
            <option value="all">All acts</option>
            {acts.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div className="text-sm text-black/60 dark:text-white/60">{filtered.length} maps</div>
        </div>

        <div className="text-sm text-black/60 dark:text-white/60">
          {dmMode ? "DM Mode: you can reveal maps for players." : "Locked maps stay hidden until discovered."}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((img) => {
          const pub = isPublic(img.id);
          const locked = !dmMode && !pub;

          const title = locked ? "Unknown Map" : img.title;
          const subtitle = locked ? "Locked" : img.act;
          const href = locked ? undefined : `/campaign/${img.path}`;

          return (
            <div
              key={img.id}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={`/campaign/${img.path}`}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className={classNames(
                    "object-cover transition-transform duration-200",
                    locked ? "blur-md" : "group-hover:scale-[1.02]"
                  )}
                />
                {locked ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-white">
                      🔒 Locked
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-black/60 dark:text-white/60">{subtitle}</div>
                    <div className="mt-1 font-semibold tracking-tight">{title}</div>
                  </div>

                  {dmMode ? (
                    <button
                      onClick={() => setPublic(img.id, !pub)}
                      className={classNames(
                        "rounded-full border px-2 py-0.5 text-xs transition",
                        pub
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-black/10 text-black/60 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
                      )}
                      title={pub ? "Currently visible to players" : "Hidden from players"}
                    >
                      {pub ? "Public" : "Hidden"}
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 text-xs text-black/60 dark:text-white/60">
                  {locked ? "Ask your DM to reveal this after you discover it." : "Click to open full size"}
                </div>

                <div className="mt-4">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      Open <span aria-hidden>→</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/40 dark:border-white/10 dark:text-white/40"
                    >
                      Locked <span aria-hidden>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
