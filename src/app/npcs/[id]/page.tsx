import { notFound } from "next/navigation";
import { findNpcById } from "@/lib/campaign";
import NpcViewer from "@/components/NpcViewer";

// ✅ Next 16: params is async in dynamic routes
export default async function NpcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const npc = findNpcById(id);
  if (!npc) return notFound();

  return <NpcViewer npc={npc} />;
}
