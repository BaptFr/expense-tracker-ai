import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type Cell = string | number;

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value: Cell): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function writeCsvTable(headers: string[], rows: Cell[][], filename: string): void {
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function writeJsonPayload(payload: unknown, filename: string): void {
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" }),
    filename
  );
}

export function writePdfTable(
  title: string,
  subtitle: string,
  headers: string[],
  rows: Cell[][],
  filename: string,
  footerRow?: Cell[]
): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 40, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(subtitle, 40, 58);

  autoTable(doc, {
    startY: 74,
    head: [headers],
    body: rows,
    foot: footerRow ? [footerRow] : undefined,
    headStyles: { fillColor: [11, 11, 11], textColor: 255 },
    footStyles: { fillColor: [240, 239, 236], textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 6 },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`,
        40,
        doc.internal.pageSize.getHeight() - 20
      );
    },
  });

  doc.save(filename);
}
