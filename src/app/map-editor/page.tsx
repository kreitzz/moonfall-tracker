import { Suspense } from "react";
import { getCampaign } from "@/lib/campaign";
import MapEditor from "@/components/MapEditor";

export default function MapEditorPage() {
  const campaign = getCampaign();
  const editorImages = campaign.images.filter(
    (img) => img.act === "Act 1" || img.id === "act-2-maps-bandit-camp-png"
  );

  return (
    <Suspense fallback={<div className="text-sm text-black/70 dark:text-white/70">Loading map editor...</div>}>
      <MapEditor images={editorImages} />
    </Suspense>
  );
}
