import { DestinationId, ExportFormat, ExportHistoryEntry } from "@/lib/cloudExport/types";
import { formatRelativeTime } from "@/lib/cloudExport/relativeTime";

const DESTINATION_BADGE: Record<DestinationId, string> = {
  download: "bg-[#f0efec] text-[#52514e]",
  email: "bg-[#eaf2fc] text-[#2a78d6]",
  "google-sheets": "bg-[#e5f6ef] text-[#1baf7a]",
  dropbox: "bg-[#eaf2fc] text-[#2a78d6]",
  onedrive: "bg-[#f0efec] text-[#0b0b0b]",
};

const FORMAT_LABEL: Record<ExportFormat, string> = { csv: "CSV", json: "JSON", pdf: "PDF" };

interface ExportHistoryTableProps {
  history: ExportHistoryEntry[];
  onClear: () => void;
}

export function ExportHistoryTable({ history, onClear }: ExportHistoryTableProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0b0b0b]">Exports récents</h3>
        {history.length > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-[#898781] hover:text-[#d03b3b]">
            Effacer l&apos;historique
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#e1e0d9] px-4 py-6 text-center text-sm text-[#898781]">
          Aucun export pour le moment — les actions de cette page apparaîtront ici.
        </div>
      ) : (
        <ul className="divide-y divide-[#ece9e2] rounded-lg border border-[#e1e0d9]">
          {history.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-[#0b0b0b]">{entry.templateLabel}</span>
                  <span className="rounded-full bg-[#f0efec] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#898781]">
                    {FORMAT_LABEL[entry.format]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#898781]">
                  {entry.recordCount} ligne{entry.recordCount === 1 ? "" : "s"} · {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${DESTINATION_BADGE[entry.destination]}`}
              >
                {entry.destinationLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
