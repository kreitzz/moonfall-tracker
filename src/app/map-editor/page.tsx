import { Suspense } from "react";
import { getCampaign } from "@/lib/campaign";
import MapEditor from "@/components/MapEditor";

export default function MapEditorPage() {
  const campaign = getCampaign();
  const editorImages = campaign.images.filter(
    (img) =>
      img.act === "Act 1" ||
      img.id === "act-2-maps-bandit-camp-png" ||
      img.id === "act-2-maps-greyhaven-jpg" ||
      img.id === "act-2-maps-circle-of-promise-jpg" ||
      img.id === "act-2-maps-weeping-marsh-jpg" ||
      img.id === "act-2-maps-weeping-marsh-bottom-of-the-well-jpg" ||
      img.id === "act-2-maps-lunaryth-jpg" ||
      img.id === "act-2-maps-lunaryth-burning-png" ||
      img.id === "act-2-maps-lunaryth-castle-ballroom-jpg" ||
      img.id === "act-2-maps-lunaryth-arena-jpg" ||
      img.id === "act-2-maps-lunaryth-red-light-underground-jpg" ||
      img.id === "act-2-maps-shar-temple-below-lunaryth-jpg"
  );

  return (
    <Suspense fallback={<div className="text-sm text-black/70 dark:text-white/70">Loading map editor...</div>}>
      <MapEditor images={editorImages} />
    </Suspense>
  );
}
