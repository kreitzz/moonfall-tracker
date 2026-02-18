"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { findDocById, findSessionByDocId, isSessionDocId } from "@/lib/campaign";
import DocViewer from "@/components/DocViewer";
import { useDmMode } from "@/components/DmModeProvider";

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dmMode } = useDmMode();

  const doc = useMemo(() => findDocById(id), [id]);

  useEffect(() => {
    if (isSessionDocId(id)) {
      const session = findSessionByDocId(id);
      if (session) router.replace(`/sessions/${session.id}`);
      else router.replace("/sessions");
      return;
    }

    if (!dmMode) router.replace("/");
  }, [dmMode, id, router]);

  if (!doc || isSessionDocId(id) || !dmMode) return null;

  return <DocViewer doc={doc} />;
}
