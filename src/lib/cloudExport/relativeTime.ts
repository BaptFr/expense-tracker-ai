export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 10) return "À l'instant";
  if (diffSec < 60) return `il y a ${diffSec} s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `il y a ${diffHour} h`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `il y a ${diffDay} j`;

  return new Date(iso).toLocaleDateString("fr-FR", { month: "short", day: "numeric", year: "numeric" });
}
