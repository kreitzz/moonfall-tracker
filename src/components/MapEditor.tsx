"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CampaignImage } from "@/lib/campaign";
import { useDmMode } from "@/components/DmModeProvider";

type CharacterOverlay = {
  id: string;
  kind: "character";
  characterId: CharacterId;
  name: string;
  role: string;
  imageSrc: string;
  x: number;
  y: number;
  size: number;
  statusEffects: string[];
};

type AoeOverlay = {
  id: string;
  kind: "aoe";
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  attachedToId?: string;
};

type Overlay = CharacterOverlay | AoeOverlay;

type CharacterId =
  | "echo"
  | "mead"
  | "prom"
  | "heywud"
  | "seris"
  | "nyx"
  | "caelira"
  | "aaravos"
  | "selune"
  | "shar"
  | "pyraxis"
  | "cryovex";

const CHARACTERS: Array<{
  id: CharacterId;
  name: string;
  role: string;
  imageSrc: string;
  defaultSize: number;
}> = [
  { id: "echo", name: "Echo", role: "Half-Elf Bard", imageSrc: "/party/map-tokens/echo-blonde-3d.png", defaultSize: 60 },
  { id: "mead", name: "Mead", role: "Dwarven Cleric", imageSrc: "/party/map-tokens/mead-3d.png", defaultSize: 60 },
  { id: "prom", name: "Prom", role: "Half-Orc Barbarian", imageSrc: "/party/map-tokens/prom-3d.png", defaultSize: 60 },
  { id: "heywud", name: "Heywud", role: "Goliath Wizard", imageSrc: "/party/map-tokens/heywud-3d.png", defaultSize: 60 },
  { id: "seris", name: "Seris", role: "Half-Elf Moon Cleric", imageSrc: "/party/map-tokens/seris-ornate-lunar-gown-3d.png", defaultSize: 60 },
  { id: "nyx", name: "Nyx Amberline", role: "Former Guild Games Champion • Fiend Warlock", imageSrc: "/party/map-tokens/nyx-amberline-arena-champion-3d.png", defaultSize: 60 },
  { id: "caelira", name: "Caelira", role: "Eclipse Twin • Final Form", imageSrc: "/party/map-tokens/caelira-final-form-3d.png", defaultSize: 60 },
  { id: "aaravos", name: "Aaravos", role: "Chosen of Shar", imageSrc: "/party/map-tokens/aaravos-reference-informed-3d.png", defaultSize: 60 },
  { id: "selune", name: "Selûne", role: "Goddess of the Moon", imageSrc: "/party/map-tokens/selune-reference-informed-3d.png", defaultSize: 60 },
  { id: "shar", name: "Shar", role: "Goddess of Darkness and Loss", imageSrc: "/party/map-tokens/shar-reference-informed-3d.png", defaultSize: 60 },
  { id: "pyraxis", name: "Lightning & Fire Dragon", role: "Dragon", imageSrc: "/party/map-tokens/lightning-fire-dragon-soaring-3d.png", defaultSize: 190 },
  { id: "cryovex", name: "Frost Dragon", role: "Dragon", imageSrc: "/party/map-tokens/frost-dragon-soaring-3d.png", defaultSize: 190 },
];

const HIDDEN_CHARACTER_IDS = new Set<CharacterId>(["caelira", "aaravos", "selune", "shar"]);

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

const COMMON_STATUS_EFFECTS = [
  "Blessed",
  "Concentrating",
  "Poisoned",
  "Prone",
  "Stunned",
  "Frightened",
  "Charmed",
  "Invisible",
  "Restrained",
  "Unconscious",
];

function imageSrcFromPath(path: string, version?: string) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const basePath =
    path.startsWith("Act 1/") || path.startsWith("General/") ? `/campaign/${encoded}` : `/${encoded}`;
  return `${basePath}${version ? `?v=${version}` : ""}`;
}

function hexToRgba(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((c) => `${c}${c}`).join("") : normalized;
  const parsed = Number.parseInt(value, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function MapEditor({ images }: { images: CampaignImage[] }) {
  const { dmMode } = useDmMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragRef = useRef<DragState | null>(null);
  const nextOverlayIdRef = useRef(1);

  const [overlaysByImage, setOverlaysByImage] = useState<Record<string, Overlay[]>>({});
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [highlightAll, setHighlightAll] = useState(false);
  const [dragAll, setDragAll] = useState(false);
  const [statusToAdd, setStatusToAdd] = useState(COMMON_STATUS_EFFECTS[0]);
  const [customStatus, setCustomStatus] = useState("");

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
  const selectedCharacterOverlay = selectedOverlay?.kind === "character" ? selectedOverlay : null;
  const selectedAoeOverlay = selectedOverlay?.kind === "aoe" ? selectedOverlay : null;
  const characterOverlays = useMemo(
    () => overlays.filter((o): o is CharacterOverlay => o.kind === "character"),
    [overlays]
  );

  function selectImage(imageId: string) {
    router.replace(`/map-editor?imageId=${encodeURIComponent(imageId)}`);
    setSelectedOverlayId(null);
  }

  function addCharacter(characterId: CharacterId) {
    if (!selectedImage || !selectedImageId) {
      return;
    }

    const character = CHARACTERS.find((candidate) => candidate.id === characterId);
    if (!character) {
      return;
    }

    const id = `character-${nextOverlayIdRef.current++}`;
    const overlay: Overlay = {
      id,
      kind: "character",
      characterId: character.id,
      name: character.name,
      role: character.role,
      imageSrc: character.imageSrc,
      x: 24,
      y: 24,
      size: character.defaultSize,
      statusEffects: [],
    };

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: [...(prev[selectedImageId] ?? []), overlay],
    }));
    setSelectedOverlayId(id);
  }

  function addAoeOverlay(template: "cloud" | "spirit") {
    if (!selectedImage || !selectedImageId) {
      return;
    }

    const id = `aoe-${nextOverlayIdRef.current++}`;
    const overlay: Overlay =
      template === "cloud"
        ? {
            id,
            kind: "aoe",
            label: "Cloud of Daggers",
            x: 80,
            y: 80,
            size: 140,
            color: "#8b5cf6",
            opacity: 0.3,
          }
        : {
            id,
            kind: "aoe",
            label: "Spirit Guardians",
            x: 80,
            y: 80,
            size: 220,
            color: "#facc15",
            opacity: 0.25,
          };

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: [...(prev[selectedImageId] ?? []), overlay],
    }));
    setSelectedOverlayId(id);
  }

  function updateSelectedOverlay(patch: Partial<CharacterOverlay> | Partial<AoeOverlay>) {
    if (!selectedOverlayId || !selectedImageId) {
      return;
    }

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: (prev[selectedImageId] ?? []).map((o) =>
        o.id === selectedOverlayId ? ({ ...o, ...patch } as Overlay) : o
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

  function addStatusEffect(status: string) {
    const cleanStatus = status.trim();
    if (!selectedCharacterOverlay || !cleanStatus) {
      return;
    }
    const currentStatuses = selectedCharacterOverlay.statusEffects ?? [];
    if (!currentStatuses.some((existing) => existing.toLowerCase() === cleanStatus.toLowerCase())) {
      updateSelectedOverlay({ statusEffects: [...currentStatuses, cleanStatus] });
    }
    setCustomStatus("");
  }

  function removeStatusEffect(status: string) {
    if (!selectedCharacterOverlay) {
      return;
    }
    updateSelectedOverlay({
      statusEffects: (selectedCharacterOverlay.statusEffects ?? []).filter((existing) => existing !== status),
    });
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
      dragAll,
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

    setOverlaysByImage((prev) => ({
      ...prev,
      [selectedImageId]: (prev[selectedImageId] ?? []).map((o) => {
        const shouldMove = o.id === drag.overlayId || (o.kind === "aoe" && o.attachedToId === drag.overlayId);
        if (!shouldMove) {
          return o;
        }

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
          <h1 className="text-2xl font-semibold tracking-tight">Campaign Map Editor</h1>
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
        <h1 className="text-2xl font-semibold tracking-tight">Campaign Map Editor</h1>
        <p className="mt-1 text-black/70 dark:text-white/70">
          Choose a map, add party members, then drag their tokens into position.
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-3 text-sm font-medium">Available maps</div>
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

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm font-medium">Add a character or creature</div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {CHARACTERS.filter((character) => !HIDDEN_CHARACTER_IDS.has(character.id)).map((character) => (
              <button
                key={character.id}
                onClick={() => addCharacter(character.id)}
                className="flex items-center gap-3 rounded-xl border border-black/10 p-2 text-left hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              >
                <img
                  src={character.imageSrc}
                  alt=""
                  className="h-14 w-14 object-contain drop-shadow-md"
                />
                <span className="min-w-0">
                  <span className="block font-medium">{character.name}</span>
                  <span className="block truncate text-xs text-black/60 dark:text-white/60">{character.role}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <button
            onClick={() => addAoeOverlay("cloud")}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          >
            Add Cloud of Daggers
          </button>
          <button
            onClick={() => addAoeOverlay("spirit")}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          >
            Add Spirit Guardians
          </button>
          <button
            onClick={() => setHighlightAll((v) => !v)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
          >
            {highlightAll ? "Hide Highlights" : "Highlight All Overlays"}
          </button>
          <button
            onClick={() => setDragAll((v) => !v)}
            className={
              dragAll
                ? "rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
                : "rounded-lg border border-black/10 px-3 py-2 text-sm text-black/80 hover:bg-black/5 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/10"
            }
          >
            {dragAll ? "Drag All: ON" : "Drag All Overlays"}
          </button>
        </div>

        <div className="grid gap-3 lg:col-span-2">
          <label className="grid gap-1 text-sm">
            Character token size
            <input
              type="number"
              min={40}
              max={240}
              value={selectedCharacterOverlay?.size ?? 60}
              onChange={(e) => updateSelectedOverlay({ size: Number(e.target.value) || 60 })}
              disabled={!selectedCharacterOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20"
            />
          </label>
        </div>

        <div className="grid gap-3 rounded-xl border border-black/10 p-3 dark:border-white/10 lg:col-span-2">
          <div>
            <div className="text-sm font-medium">Status effects</div>
            <div className="mt-1 text-xs text-black/60 dark:text-white/60">
              Select a character, then add or remove conditions. Effects travel with their token.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusToAdd}
              onChange={(event) => setStatusToAdd(event.target.value)}
              disabled={!selectedCharacterOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10"
            >
              {COMMON_STATUS_EFFECTS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              onClick={() => addStatusEffect(statusToAdd)}
              disabled={!selectedCharacterOverlay}
              className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-black"
            >
              Add status
            </button>
            <input
              value={customStatus}
              onChange={(event) => setCustomStatus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addStatusEffect(customStatus);
              }}
              disabled={!selectedCharacterOverlay}
              placeholder="Custom status"
              className="min-w-40 flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm disabled:opacity-60 dark:border-white/10"
            />
            <button
              onClick={() => addStatusEffect(customStatus)}
              disabled={!selectedCharacterOverlay || !customStatus.trim()}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm disabled:opacity-40 dark:border-white/10"
            >
              Add custom
            </button>
          </div>
          <div className="flex min-h-7 flex-wrap gap-1.5">
            {(selectedCharacterOverlay?.statusEffects ?? []).map((status) => (
              <button
                key={status}
                onClick={() => removeStatusEffect(status)}
                title={`Remove ${status}`}
                className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-950 hover:bg-red-100 dark:bg-amber-300/20 dark:text-amber-100"
              >
                {status} ×
              </button>
            ))}
            {selectedCharacterOverlay && !(selectedCharacterOverlay.statusEffects ?? []).length ? (
              <span className="text-xs text-black/50 dark:text-white/50">No active effects</span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4 lg:col-span-2">
          <label className="grid gap-1 text-sm">
            AoE size
            <input
              type="number"
              min={20}
              max={800}
              value={selectedAoeOverlay?.size ?? 160}
              onChange={(e) => updateSelectedOverlay({ size: Number(e.target.value) || 160 })}
              disabled={!selectedAoeOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Attach to player
            <select
              value={selectedAoeOverlay?.attachedToId ?? ""}
              onChange={(e) => updateSelectedOverlay({ attachedToId: e.target.value || undefined })}
              disabled={!selectedAoeOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20"
            >
              <option value="">None</option>
              {characterOverlays.map((overlay) => (
                <option key={overlay.id} value={overlay.id}>
                  {overlay.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            AoE color
            <input
              type="color"
              value={selectedAoeOverlay?.color ?? "#facc15"}
              onChange={(e) => updateSelectedOverlay({ color: e.target.value })}
              disabled={!selectedAoeOverlay}
              className="h-10 rounded-lg border border-black/10 bg-transparent px-1 py-1 disabled:opacity-60 dark:border-white/10"
            />
          </label>

          <label className="grid gap-1 text-sm">
            AoE opacity
            <input
              type="number"
              min={0.05}
              max={0.8}
              step={0.05}
              value={selectedAoeOverlay?.opacity ?? 0.3}
              onChange={(e) => updateSelectedOverlay({ opacity: Number(e.target.value) || 0.3 })}
              disabled={!selectedAoeOverlay}
              className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 dark:border-white/10 dark:focus:ring-white/20"
            />
          </label>
        </div>

        <input
          value={selectedCharacterOverlay?.name ?? selectedAoeOverlay?.label ?? ""}
          onChange={(e) =>
            selectedOverlay?.kind === "aoe"
              ? updateSelectedOverlay({ label: e.target.value })
              : updateSelectedOverlay({ name: e.target.value })
          }
          disabled={!selectedOverlay}
          placeholder="Select an overlay to edit label"
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

            {overlays.map((overlay) => {
              const selected = overlay.id === selectedOverlayId;
              const highlighted = selected || highlightAll;

              if (overlay.kind === "aoe") {
                const attachedCharacter = overlay.attachedToId
                  ? characterOverlays.find((characterOverlay) => characterOverlay.id === overlay.attachedToId)?.name
                  : null;
                return (
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
                    className="absolute flex cursor-grab select-none items-center justify-center rounded-full border-2 font-semibold"
                    style={{
                      left: `${overlay.x}px`,
                      top: `${overlay.y}px`,
                      width: `${overlay.size}px`,
                      height: `${overlay.size}px`,
                      borderColor: overlay.color,
                      backgroundColor: hexToRgba(overlay.color, overlay.opacity),
                      outline: highlighted ? "2px solid #3b82f6" : "none",
                      color: "#ffffff",
                      textShadow: "0 1px 3px #000000, 0 0 4px #000000",
                      zIndex: 10,
                    }}
                  >
                    <span className="px-2 text-center text-xs">
                      {overlay.label}
                      {attachedCharacter ? ` (${attachedCharacter})` : ""}
                    </span>
                  </div>
                );
              }

              return (
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
                  className="absolute cursor-grab select-none touch-none"
                  style={{
                    left: `${overlay.x}px`,
                    top: `${overlay.y}px`,
                    width: `${overlay.size}px`,
                    height: `${overlay.size}px`,
                    zIndex: 20,
                  }}
                >
                  <img
                    src={overlay.imageSrc}
                    alt={overlay.name}
                    draggable={false}
                    className="h-full w-full object-contain drop-shadow-[0_5px_4px_rgba(0,0,0,0.75)]"
                    style={{
                      filter: selected
                        ? "drop-shadow(0 0 5px #3b82f6) drop-shadow(0 4px 3px rgba(0,0,0,.8))"
                        : highlightAll
                          ? "drop-shadow(0 0 5px #f59e0b) drop-shadow(0 4px 3px rgba(0,0,0,.8))"
                          : "drop-shadow(0 4px 3px rgba(0,0,0,.8))",
                    }}
                  />
                  {overlay.characterId !== "pyraxis" && overlay.characterId !== "cryovex" ? (
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white shadow">
                      {overlay.name}
                    </span>
                  ) : null}
                  {(overlay.statusEffects ?? []).length ? (
                    <div className="pointer-events-none absolute left-1/2 top-full mt-6 flex max-w-40 -translate-x-1/2 flex-wrap justify-center gap-1">
                      {(overlay.statusEffects ?? []).map((status) => (
                        <span key={status} className="whitespace-nowrap rounded-full border border-amber-200/70 bg-black/85 px-1.5 py-0.5 text-[9px] font-semibold text-amber-100 shadow">
                          {status}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
