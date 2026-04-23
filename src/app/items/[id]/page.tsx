import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { findItemById } from "@/lib/campaign";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = findItemById(id);
  if (!item) return notFound();
  const images = (item as { images?: { src: string; label?: string }[] }).images ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60 dark:text-white/60">Key Item</div>
        <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
        <div className="text-black/70 dark:text-white/70">
          {item.category}{item.holder ? ` · ${item.holder}` : ""} · {item.status}
        </div>
      </header>

      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        {images.length ? (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <figure
                key={image.src}
                className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative aspect-[5/7]">
                  <Image
                    src={image.src}
                    alt={`${item.title}${image.label ? ` ${image.label}` : ""}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {image.label ? (
                  <figcaption className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                    {image.label}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ) : null}

        <p className="max-w-3xl text-black/70 dark:text-white/70">{item.summary}</p>
        {item.content ? (
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-black/75 dark:text-white/75">
            {item.content}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/items"
            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          >
            ← Back to items
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
