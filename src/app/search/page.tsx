import { getCampaign } from "@/lib/campaign";
import GlobalSearch from "@/components/GlobalSearch";

export default function SearchPage() {
  const campaign = getCampaign();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Type anything — NPC names, locations, items, “Moonfall Grotto”, etc.
        </p>
      </header>
      <GlobalSearch campaign={campaign} />
    </div>
  );
}
