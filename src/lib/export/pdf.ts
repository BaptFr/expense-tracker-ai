import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";

export function writePdf(expenses: Expense[], filename: string): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport de dépenses", 40, 42);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")} — ${expenses.length} ligne${expenses.length === 1 ? "" : "s"}`, 40, 58);

  autoTable(doc, {
    startY: 74,
    head: [["Date", "Catégorie", "Montant", "Description"]],
    body: expenses.map((e) => [formatDate(e.date), CATEGORY_META[e.category].label, formatCurrency(e.amount), e.description]),
    foot: [["", "", formatCurrency(total), "Total"]],
    headStyles: { fillColor: [11, 11, 11], textColor: 255 },
    footStyles: { fillColor: [240, 239, 236], textColor: 20, fontStyle: "bold" },
    columnStyles: { 2: { halign: "right" } },
    styles: { fontSize: 9, cellPadding: 6 },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} sur ${pageCount}`, 40, doc.internal.pageSize.getHeight() - 20);
    },
  });

  doc.save(filename);
}
