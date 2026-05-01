type PartyNameMarkProps = {
  size?: "sm" | "lg";
};

export default function PartyNameMark({ size = "sm" }: PartyNameMarkProps) {
  const base = size === "lg" ? "text-3xl" : "text-base";
  const four = size === "lg" ? "text-2xl -rotate-6 px-2 py-0.5" : "text-sm -rotate-6 px-1.5 py-0.5";

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-2 font-semibold tracking-tight ${base}`}>
      <span>
        The Belligerent{" "}
        <span className="relative inline-block text-black/50 dark:text-white/50">
          Five
          <span className="absolute left-0 top-1/2 h-1 w-full -rotate-12 rounded-full bg-red-600" aria-hidden />
        </span>
      </span>
      <span
        className={`inline-block rounded-md border-2 border-red-600 bg-yellow-200 font-black uppercase text-red-700 shadow-sm ${four}`}
        aria-label="Four"
      >
        Four
      </span>
    </span>
  );
}
