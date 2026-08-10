import { TemplateBuild } from "@/lib/cloudExport/templates";

const PREVIEW_LIMIT = 6;

export function PreviewPanel({ title, subtitle, headers, rows, footerRow, recordCount }: TemplateBuild) {
  const shown = rows.slice(0, PREVIEW_LIMIT);
  const hidden = rows.length - shown.length;

  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[#0b0b0b]">{title}</h3>
          <p className="text-xs text-[#898781]">{subtitle}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-[#f0efec] px-2.5 py-1 text-xs font-medium text-[#52514e]">
          {recordCount} record{recordCount === 1 ? "" : "s"}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#e1e0d9] px-4 py-6 text-center text-sm text-[#898781]">
          No data matches this template yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#e1e0d9]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f9f9f7] text-xs uppercase tracking-wide text-[#898781]">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-2 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece9e2]">
              {shown.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-2 text-[#52514e]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {footerRow && (
              <tfoot className="border-t border-[#ece9e2] bg-[#f9f9f7] font-medium text-[#0b0b0b]">
                <tr>
                  {footerRow.map((cell, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
          {hidden > 0 && (
            <div className="border-t border-[#ece9e2] bg-[#f9f9f7] px-3 py-2 text-center text-xs text-[#898781]">
              + {hidden} more row{hidden === 1 ? "" : "s"} not shown
            </div>
          )}
        </div>
      )}
    </div>
  );
}
