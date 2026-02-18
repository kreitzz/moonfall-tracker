"use client";

import { Fragment } from "react";
import Link from "next/link";
import { CampaignDoc, isDmOnlyDoc } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

function normalizeText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.filter((x) => typeof x === "string").join("\n\n");
  if (content == null) return "";
  return String(content);
}

type Block =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "list"; items: string[]; ordered: boolean }
  | { kind: "paragraph"; lines: string[] };

function uppercaseRatio(text: string) {
  const letters = text.match(/[A-Za-z]/g) ?? [];
  if (letters.length === 0) return 0;
  const upper = letters.filter((ch) => ch === ch.toUpperCase()).length;
  return upper / letters.length;
}

function looksLikeHeading(text: string) {
  if (text.length > 120) return false;
  if (/[.?!]$/.test(text)) return false;
  return uppercaseRatio(text) > 0.75;
}

function parseBlocks(content: unknown): Block[] {
  const text = normalizeText(content);
  const chunks = text
    .split(/\n{2,}/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const lines = chunk
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 1 && looksLikeHeading(lines[0])) {
      const heading = lines[0];
      if (heading.length <= 32) {
        return { kind: "subheading", text: heading };
      }
      return { kind: "heading", text: heading };
    }

    if (lines.length >= 2) {
      const ordered = lines.every((line) => /^\\d+[.)]\\s+/.test(line));
      const unordered = lines.every((line) => /^[-*•]\\s+/.test(line));
      if (ordered || unordered) {
        const items = lines.map((line) =>
          line.replace(/^\\d+[.)]\\s+/, "").replace(/^[-*•]\\s+/, ""),
        );
        return { kind: "list", items, ordered };
      }
    }

    return { kind: "paragraph", lines };
  });
}



export default function DocViewer({
  doc,
  backHref = "/docs",
  backLabel = "Back to DM tools",
  showBackLink = true,
}: {
  doc: CampaignDoc;
  backHref?: string;
  backLabel?: string;
  showBackLink?: boolean;
}) {
  const { dmMode } = useDmMode();
  const dmOnly = isDmOnlyDoc(doc);
  const titleHidden = dmOnly && !dmMode;

  // Content is locked if DM-only and you’re not in DM mode.
  const contentLocked = dmOnly && !dmMode;

  const title = titleHidden ? "Unknown Entry" : doc.title;

  const metaLine = [doc.act, doc.category, !titleHidden ? doc.path : null].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {metaLine ? <div className="text-sm text-black/60 dark:text-white/60">{metaLine}</div> : null}

          {dmOnly ? (
            <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
              DM-only
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {!dmOnly ? (
          <div className="inline-flex w-fit rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
            Player-safe
          </div>
        ) : null}
      </header>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        {contentLocked ? (
          <div className="space-y-3">
            <div className="text-base font-semibold">Locked</div>
            <div className="text-sm text-black/70 dark:text-white/70">
              This entry is DM-only.
            </div>
            <div className="text-sm text-black/60 dark:text-white/60">
              DM: toggle DM Mode in the navbar to view this document.
            </div>
          </div>
        ) : (
          <div className="prose max-w-none text-black dark:text-white">
            {parseBlocks(doc.content).map((block, idx) => {
              if (block.kind === "heading") {
                return <h2 key={idx}>{block.text}</h2>;
              }
              if (block.kind === "subheading") {
                return <h3 key={idx}>{block.text}</h3>;
              }
              if (block.kind === "list") {
                const ListTag = block.ordered ? "ol" : "ul";
                return (
                  <ListTag key={idx}>
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ListTag>
                );
              }
              return (
                <p key={idx}>
                  {block.lines.map((line, lineIdx) => (
                    <Fragment key={lineIdx}>
                      {line}
                      {lineIdx < block.lines.length - 1 ? <br /> : null}
                    </Fragment>
                  ))}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {showBackLink ? (
        <div>
          <Link href={backHref} className="text-sm text-black/70 hover:underline dark:text-white/70">
            ← {backLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
