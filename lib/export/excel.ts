/** Panel schedule → styled .xlsx, using exceljs (lazy-loaded, client-side only). */

export async function exportPanelExcel(opts: {
  name: string;
  voltageLabel: string;
  rows: (string | number)[][];
  phaseTotals: { label: string; kva: string }[];
}) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "VoltCalc";
  const ws = wb.addWorksheet("Panel Schedule");

  ws.mergeCells("A1:G1");
  const title = ws.getCell("A1");
  title.value = `VoltCalc — Panel Schedule: ${opts.name}`;
  title.font = { bold: true, size: 14, color: { argb: "FF1E5EFF" } };
  ws.mergeCells("A2:G2");
  ws.getCell("A2").value = opts.voltageLabel;
  ws.getCell("A2").font = { color: { argb: "FF6E7889" } };

  const headerRow = ws.addRow(["Ckt", "Description", "Type", "Load (VA)", "Poles", "Trip (A)", "Phase"]);
  headerRow.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E5EFF" } };
    c.alignment = { horizontal: "center" };
  });

  for (const r of opts.rows) ws.addRow(r);

  ws.addRow([]);
  for (const p of opts.phaseTotals) {
    const row = ws.addRow(["", "", "", "", "", p.label, `${p.kva} kVA`]);
    row.getCell(6).font = { bold: true };
  }

  ws.columns = [
    { width: 6 }, { width: 30 }, { width: 14 }, { width: 12 }, { width: 8 }, { width: 10 }, { width: 12 },
  ];
  ws.getRow(3).height = 18;

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `panel-schedule-${opts.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "voltcalc"}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
