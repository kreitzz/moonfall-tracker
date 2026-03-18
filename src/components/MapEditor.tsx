"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CampaignImage } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

type Overlay = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  stroke: string;
};

type DragState = {
  overlayId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  dragAll: boolean;
  startPositions: Record<string, { x: number; y: number }>;
};

function imageSrcFromPath(path: string, version?: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `/campaign/${encoded}${version ? `?v=${version}` : ""}`;
}

export default function MapEditor({ images }: { images: CampaignImage[] }) {
  const { dmMode } = useDmMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragRef = useRef<DragState | null>(null);

  const [overlaysByImage, setOverlaysByImage] = useState<Record<string, Overlay[]>>({});
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [newText, setNewText] = useState("New Text");
  const [highlightAll, setHighlightAll] = useState(false);
  const [dragAllText, setDragAllText] = useState(false);

  const queryImageId = searchParams.get("imageId");
  const selectedImageId =
    queryImageId && images.some((img) => img.id === queryImageId) ? queryImageId : (images[0]?.id ?? null);

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) ?? null,
    [images, selectedImageId]
  );

  const overlays = useMemo(() => {
    if (!selectedImageId) {
      return [];
    }
    return overlaysByImage[selectedImageId] ?? [];
  }, [overlaysByImage, selectedImageId]);

  const selectedOverlay = useMemo(
    () => overlays.find((o) => o.id === selectedOverlayId) ?? null,
    [overlays, selectedOverlayId]
  );

  function selectImage(imageId: string) {
    router.replace(`/map-editor?imageId=${encodeURIComponent(imageId)}`);
    setSelectedOverlayId(null);
  }

  function addOverlay() {
    if (!selectedImage || !selectedImageId) {
      return;
    }

    const id = `ov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const overlay: Overlay = {
      id,
      text: newText.trim() || "New Text",
      x: 24,
      y: 24,
      fontSize: 36,
      color: "#ffffff",
      stroke: "#000000",
    };

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: [...(prev[selectedImageId] ?? []), overlay],
    }));
    setSelectedOverlayId(id);
  }

  function updateSelectedOverlay(patch: Partial<Overlay>) {
    if (!selectedOverlayId || !selectedImageId) {
      return;
    }

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: (prev[selectedImageId] ?? []).map((o) =>
        o.id === selectedOverlayId ? { ...o, ...patch } : o
      ),
    }));
  }

  function deleteSelectedOverlay() {
    if (!selectedOverlayId || !selectedImageId) {
      return;
    }
    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: (prev[selectedImageId] ?? []).filter((o) => o.id !== selectedOverlayId),
    }));
    setSelectedOverlayId(null);
  }

  function onOverlayPointerDown(event: React.PointerEvent<HTMLDivElement>, overlay: Overlay) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedOverlayId(overlay.id);

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    dragRef.current = {
      overlayId: overlay.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: overlay.x,
      startY: overlay.y,
      dragAll: dragAllText,
      startPositions: Object.fromEntries(overlays.map((o) => [o.id, { x: o.x, y: o.y }])),
    };
  }

  function onOverlayPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const stage = stageRef.current;
    const overlayEl = overlayRefs.current[drag.overlayId];
    if (!stage || !overlayEl) {
      return;
    }

    const dx = event.clientX - drag.startClientX;
    const dy = event.clientY - drag.startClientY;

    if (!selectedImageId) {
      return;
    }

    if (drag.dragAll) {
      setOverlaysByImage((prev) => ({
        ...prev,
        [selectedImageId]: (prev[selectedImageId] ?? []).map((o) => {
          const start = drag.startPositions[o.id] ?? { x: o.x, y: o.y };
          const el = overlayRefs.current[o.id];
          const maxX = Math.max(0, stage.clientWidth - (el?.offsetWidth ?? 0));
          const maxY = Math.max(0, stage.clientHeight - (el?.offsetHeight ?? 0));
          return {
            ...o,
            x: Math.max(0, Math.min(maxX, start.x + dx)),
            y: Math.max(0, Math.min(maxY, start.y + dy)),
          };
        }),
      }));
      return;
    }

    const maxX = Math.max(0, stage.clientWidth - overlayEl.offsetWidth);
    const maxY = Math.max(0, stage.clientHeight - overlayEl.offsetHeight);
    const nextX = Math.max(0, Math.min(maxX, drag.startX + dx));
    const nextY = Math.max(0, Math.min(maxY, drag.startY + dy));

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: (prev[selectedImageId] ?? []).map((o) =>
        o.id === drag.overlayId ? { ...o, x: nextX, y: nextY } : o
      ),
    }));
  }

  function onOverlayPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (!dmMode) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Act 1 Map Editor</h1>
          <p className="mt-1 text-black/70 dark:text-white/70">DM Mode is required to access this tool.</p>
        </header>
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-5 text-sm text-black/70 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          Turn on DM Mode from the top bar to unlock map editing.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Act 1 Map Editor</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Click any Act 1 image, then add and drag text directly on top.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-3 text-sm font-medium">Act 1 maps</div>
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => selectImage(img.id)}
              className={
                img.id === selectedImageId
                  ? "rounded-full border border-black bg-black px-3 py-1.5 text-sm text-white dark:border-white dark:bg-white dark:text-black"
                  : "rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
              }
            >
              {img.title}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950 lg:grid-cols-[1fr_auto]">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20"
          placeholder="Text to place on map"
        />
        <button
          onClick={addOverlay}
          className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          Add Text
        </button>

        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <button
            onClick={() => setHighlightAll((v) => !v)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          >
            {highlightAll ? "Hide Highlights" : "Highlight All Text"}
          </button>
          <button
            onClick={() => setDragAllText((v) => !v)}
            className={
              dragAllText
                ? "rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
                : "rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            }
          >
            {dragAllText ? "Drag All: ON" : "Drag All Text Together"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
          <label className="grid gap-1 text-sm">
            Font size
            <input
              type="number"
              min={10}
              max={120}
              value={selectedOverlay?.fontSize ?? 36}
              onChange={(e) => updateSelectedOverlay({ fontSize: Number(e.target.value) || 36 })}
              disabled={!selectedOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Text color
            <input
              type="color"
              value={selectedOverlay?.color ?? "#ffffff"}
              onChange={(e) => updateSelectedOverlay({ color: e.target.value })}
              disabled={!selectedOverlay}
              className="h-10 rounded-lg border border-black/10 bg-transparent px-1 py-1 disabled:opacity-60 dark:border-white/10"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Stroke color
            <input
              type="color"
              value={selectedOverlay?.stroke ?? "#000000"}
              onChange={(e) => updateSelectedOverlay({ stroke: e.target.value })}
              disabled={!selectedOverlay}
              className="h-10 rounded-lg border border-black/10 bg-transparent px-1 py-1 disabled:opacity-60 dark:border-white/10"
            />
          </label>
        </div>

        <input
          value={selectedOverlay?.text ?? ""}
          onChange={(e) => updateSelectedOverlay({ text: e.target.value })}
          disabled={!selectedOverlay}
          placeholder="Select text on map to edit this field"
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20 lg:col-span-1"
        />

        <button
          onClick={deleteSelectedOverlay}
          disabled={!selectedOverlay}
          className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10 lg:col-span-1"
        >
          Delete Selected
        </button>
      </section>

      <section className="overflow-auto rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        {!selectedImage ? (
          <div className="rounded-xl border border-dashed border-black/20 p-8 text-center text-sm text-black/60 dark:border-white/20 dark:text-white/60">
            No Act 1 maps found.
          </div>
        ) : (
          <div
            ref={stageRef}
            className="relative inline-block max-w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
            onClick={() => setSelectedOverlayId(null)}
          >
            <img
              src={imageSrcFromPath(selectedImage.path, (selectedImage as { version?: string }).version)}
              alt={selectedImage.title}
              className="block h-auto max-w-full select-none"
              draggable={false}
            />

            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                ref={(node) => {
                  overlayRefs.current[overlay.id] = node;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOverlayId(overlay.id);
                }}
                onPointerDown={(e) => onOverlayPointerDown(e, overlay)}
                onPointerMove={onOverlayPointerMove}
                onPointerUp={onOverlayPointerUp}
                onPointerCancel={onOverlayPointerUp}
                className={
                  overlay.id === selectedOverlayId
                    ? "absolute cursor-grab whitespace-nowrap rounded px-2 py-1 font-semibold leading-tight outline-2 outline-blue-500"
                    : highlightAll
                      ? "absolute cursor-grab whitespace-nowrap rounded px-2 py-1 font-semibold leading-tight outline outline-1 outline-amber-400/90"
                      : "absolute cursor-grab whitespace-nowrap rounded px-2 py-1 font-semibold leading-tight"
                }
                style={{
                  left: `${overlay.x}px`,
                  top: `${overlay.y}px`,
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.color,
                  textShadow: `-1px -1px 0 ${overlay.stroke}, 1px -1px 0 ${overlay.stroke}, -1px 1px 0 ${overlay.stroke}, 1px 1px 0 ${overlay.stroke}`,
                }}
              >
                {overlay.text}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
