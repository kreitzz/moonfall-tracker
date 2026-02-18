import { getCampaign } from "@/lib/campaign";
import MapsGallery from "@/components/MapsGallery";

export default function GalleryPage() {
  const campaign = getCampaign();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Maps</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">A quick gallery of the campaign’s map assets.</p>
      </header>
      <MapsGallery images={campaign.images} />
    </div>
  );
}
