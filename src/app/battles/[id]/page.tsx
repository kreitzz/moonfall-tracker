import { notFound } from "next/navigation";
import { findBattleById } from "@/lib/campaign";
import BattleViewer from "@/components/BattleViewer";

// ✅ Next 16: params is async in dynamic routes
export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const battle = findBattleById(id);
  if (!battle) return notFound();

  return <BattleViewer battle={battle} />;
}
