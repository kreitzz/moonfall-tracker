import { notFound } from "next/navigation";
import Link from "next/link";
import { findDocById, findSessionById } from "@/lib/campaign";
import DocViewer from "@/components/DocViewer";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = findSessionById(id);
  if (!session) return notFound();

  const doc = findDocById(session.docId);
  if (!doc) return notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">Session {session.number}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{session.title}</h1>
        {session.summary ? <div className="text-black/70 dark:text-white/70">{session.summary}</div> : null}
        {session.mvp ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            <span className="font-semibold">MVP:</span> {session.mvp.name} — {session.mvp.reason}
          </div>
        ) : null}
        {session.lowlight ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            <span className="font-semibold">Critical Fail:</span> {session.lowlight.name} — {session.lowlight.reason}
          </div>
        ) : null}
      </header>

      <DocViewer doc={doc} backHref="/sessions" backLabel="Back to sessions" />
    </div>
  );
}
