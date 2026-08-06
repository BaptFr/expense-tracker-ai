import { Expense } from "@/types/expense";
import { TemplateDefinition } from "@/lib/cloudExport/templates";
import { TemplateId, ExportFormat } from "@/lib/cloudExport/types";
import { TemplateIcon } from "@/components/cloud-export/icons";
import { Spinner } from "@/components/ui/Spinner";

const FORMAT_BADGE: Record<ExportFormat, string> = {
  pdf: "bg-[#fbeceb] text-[#d03b3b]",
  csv: "bg-[#e5f6ef] text-[#1baf7a]",
  json: "bg-[#eaf2fc] text-[#2a78d6]",
};

interface TemplateGridProps {
  templates: TemplateDefinition[];
  expenses: Expense[];
  selectedTemplateId: TemplateId;
  onSelect: (id: TemplateId) => void;
  onDownload: (id: TemplateId) => void;
  pendingAction: string | null;
}

export function TemplateGrid({
  templates,
  expenses,
  selectedTemplateId,
  onSelect,
  onDownload,
  pendingAction,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {templates.map((template) => {
        const isSelected = template.id === selectedTemplateId;
        const isDownloading = pendingAction === `download:${template.id}`;
        const recordCount = template.build(expenses).recordCount;

        return (
          <div
            key={template.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(template.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(template.id);
              }
            }}
            aria-pressed={isSelected}
            className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-colors ${
              isSelected
                ? "border-[#2a78d6] bg-[#eaf2fc]/40 ring-1 ring-inset ring-[#2a78d6]"
                : "border-[#e1e0d9] bg-white hover:bg-[#f9f9f7]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0efec] text-[#0b0b0b]">
                <TemplateIcon icon={template.icon} />
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${FORMAT_BADGE[template.format]}`}>
                {template.format}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#0b0b0b]">{template.label}</h3>
              <p className="mt-0.5 text-xs text-[#898781]">{template.description}</p>
            </div>

            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-[#52514e]">
                {recordCount} record{recordCount === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(template.id);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#2a78d6] hover:bg-white hover:underline"
              >
                {isDownloading && <Spinner className="h-3 w-3 border-[#9ec5f4] border-t-[#2a78d6]" />}
                {isDownloading ? "Preparing…" : "Quick download"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
