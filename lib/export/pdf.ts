import type { CalcResult, CalcInputs, CalcField } from "@/packages/calc-core/types";

const BRAND: [number, number, number] = [30, 94, 255];
const MUTED: [number, number, number] = [110, 120, 140];

function header(doc: import("jspdf").jsPDF, subtitle: string) {
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("VoltCalc", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Code-compliant electrical calculations", 45, 14);
  doc.setTextColor(20, 23, 41);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(subtitle, 14, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${new Date().toLocaleString("en-CA")}  ·  CEC / OESC`, 14, 38);
}

function disclaimer(doc: import("jspdf").jsPDF, text: string, y: number) {
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - 28);
  doc.text(lines, 14, y);
}

/** Export a single calculator result to a PDF report. */
export async function exportResultPdf(opts: {
  title: string;
  fields: CalcField[];
  inputs: CalcInputs;
  result: CalcResult;
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  header(doc, opts.title);

  const inputRows = opts.fields
    .filter((f) => opts.inputs[f.name] !== undefined && opts.inputs[f.name] !== "")
    .map((f) => {
      const raw = opts.inputs[f.name];
      let val = String(raw);
      if (f.type === "select") val = f.options?.find((o) => o.value === String(raw))?.label ?? val;
      if (f.type === "boolean") val = raw ? "Yes" : "No";
      return [f.label, `${val}${f.unit ? " " + f.unit : ""}`];
    });

  autoTable(doc, {
    startY: 44,
    head: [["Input", "Value"]],
    body: inputRows,
    theme: "striped",
    headStyles: { fillColor: BRAND, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 90 } },
  });

  const summaryRows = opts.result.summary.map((s) => [
    s.label,
    `${s.value}${s.unit ? " " + s.unit : ""}`,
    s.citation ? `${s.citation.code} ${s.citation.ref}` : "",
  ]);
  autoTable(doc, {
    // @ts-expect-error lastAutoTable is added by the plugin
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Result", "Value", "Reference"]],
    body: summaryRows,
    theme: "grid",
    headStyles: { fillColor: [20, 23, 41], fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2 },
  });

  const stepRows = opts.result.steps.map((s) => [
    s.label,
    s.detail ?? "",
    s.value ?? "",
    s.citation ? `${s.citation.code} ${s.citation.ref}` : "",
  ]);
  autoTable(doc, {
    // @ts-expect-error lastAutoTable is added by the plugin
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Step", "Detail", "Value", "Reference"]],
    body: stepRows,
    theme: "striped",
    headStyles: { fillColor: BRAND, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 2 },
  });

  // @ts-expect-error lastAutoTable is added by the plugin
  disclaimer(doc, opts.result.disclaimer, doc.lastAutoTable.finalY + 8);
  doc.save(`${slug(opts.title)}.pdf`);
}

/** Export a panel schedule to a PDF. */
export async function exportPanelPdf(opts: {
  name: string;
  voltageLabel: string;
  rows: (string | number)[][];
  phaseTotals: { label: string; kva: string }[];
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();
  header(doc, `Panel Schedule — ${opts.name}`);
  doc.setFontSize(9);
  doc.setTextColor(20, 23, 41);
  doc.text(opts.voltageLabel, 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Ckt", "Description", "Type", "Load (VA)", "Poles", "Trip (A)", "Phase"]],
    body: opts.rows,
    theme: "striped",
    headStyles: { fillColor: BRAND, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 1.8 },
  });

  autoTable(doc, {
    // @ts-expect-error lastAutoTable is added by the plugin
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Phase", "Connected load"]],
    body: opts.phaseTotals.map((p) => [p.label, `${p.kva} kVA`]),
    theme: "grid",
    headStyles: { fillColor: [20, 23, 41], fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2 },
    tableWidth: 90,
  });

  disclaimer(
    doc,
    "For reference only. Breaker ratings are suggested from the connected load — verify against CEC Rule 14-104 and the actual load type. Not a substitute for a stamped design.",
    // @ts-expect-error lastAutoTable is added by the plugin
    doc.lastAutoTable.finalY + 8
  );
  doc.save(`panel-schedule-${slug(opts.name)}.pdf`);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "voltcalc";
}
