import Link from "next/link";
import { getCampaign } from "@/lib/campaign";
import ItemCard from "@/components/ItemCard";

export default function ItemsPage() {
  const campaign = getCampaign();
  const items = [...(campaign.items ?? [])];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Key Items</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Notable gear, relic-adjacent rewards, and items the party should not lose track of.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="text-sm text-black/60 dark:text-white/60">
        Back to <Link href="/" className="hover:underline">Home</Link>.
      </div>
    </div>
  );
}
