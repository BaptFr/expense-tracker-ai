interface StatTileProps {
  label: string;
  value: string;
  delta?: {
    text: string;
    direction: "up" | "down" | "flat";
    isGood: boolean;
  };
  caption?: string;
  accent?: string;
}

export function StatTile({ label, value, delta, caption, accent }: StatTileProps) {
  const deltaColor = !delta
    ? ""
    : delta.direction === "flat"
      ? "text-[#52514e]"
      : delta.isGood
        ? "text-[#006300]"
        : "text-[#d03b3b]";

  const arrow = delta?.direction === "up" ? "↑" : delta?.direction === "down" ? "↓" : "→";

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2">
        {accent && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />}
        <p className="text-sm font-medium text-[#52514e]">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#0b0b0b]">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs font-medium ${deltaColor}`}>
          {arrow} {delta.text}
        </p>
      )}
      {caption && !delta && <p className="mt-1 text-xs font-medium text-[#52514e]">{caption}</p>}
    </div>
  );
}
