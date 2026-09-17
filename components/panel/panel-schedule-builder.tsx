"use client";

import { useMemo, useState } from "react";
import { Download, FileDown, Plus, Trash2, Zap } from "lucide-react";
import { nextStandardOcpd } from "@/packages/codes/cec/data/corrections";

type Poles = 1 | 2 | 3;
interface Circuit {
  id: number;
  desc: string;
  type: string;
  loadVA: number;
  poles: Poles;
  slots: number[]; // occupied positions (same column, stepping by 2)
}

const VOLTAGES = [
  { key: "120/240-1", label: "120/240 V, 1Φ (split)", ln: 120, ll: 240, phases: 2 },
  { key: "120/208-3", label: "120/208 V, 3Φ", ln: 120, ll: 208, phases: 3 },
  { key: "277/480-3", label: "277/480 V, 3Φ", ln: 277, ll: 480, phases: 3 },
];
const LOAD_TYPES = ["Lighting", "Receptacle", "HVAC", "Motor", "Appliance", "Other"];
const PHASE_LABELS = ["A", "B", "C"];

export function PanelScheduleBuilder() {
  const [voltageKey, setVoltageKey] = useState("120/208-3");
  const [capacity, setCapacity] = useState(42);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [nextId, setNextId] = useState(1);

  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Receptacle");
  const [loadVA, setLoadVA] = useState<number | "">(1200);
  const [poles, setPoles] = useState<Poles>(1);

  const cfg = VOLTAGES.find((v) => v.key === voltageKey)!;
  const phaseCount = cfg.phases;

  function phaseOfPosition(pos: number): number {
    const row = Math.ceil(pos / 2);
    return (row - 1) % phaseCount;
  }

  const occupied = useMemo(() => new Set(circuits.flatMap((c) => c.slots)), [circuits]);

  function findSlots(p: Poles): number[] | null {
    for (let start = 1; start <= capacity; start++) {
      const slots: number[] = [];
      for (let k = 0; k < p; k++) slots.push(start + k * 2);
      if (slots.every((s) => s <= capacity && !occupied.has(s))) return slots;
    }
    return null;
  }

  function addCircuit() {
    const va = typeof loadVA === "number" ? loadVA : 0;
    if (!desc.trim() || va <= 0) return;
    const slots = findSlots(poles);
    if (!slots) {
      alert("No free slots for this breaker size. Increase panel capacity or remove circuits.");
      return;
    }
    setCircuits((c) => [...c, { id: nextId, desc: desc.trim(), type, loadVA: va, poles, slots }]);
    setNextId((n) => n + 1);
    setDesc("");
  }

  function remove(id: number) {
    setCircuits((c) => c.filter((x) => x.id !== id));
  }

  function tripFor(c: Circuit): number {
    const current = c.poles === 1 ? c.loadVA / cfg.ln : c.poles === 2 ? c.loadVA / cfg.ll : c.loadVA / (Math.sqrt(3) * cfg.ll);
    return Math.max(15, nextStandardOcpd(current));
  }

  // Per-phase load (VA) — a p-pole breaker splits its load across the phases it spans.
  const phaseTotals = useMemo(() => {
    const totals = new Array(phaseCount).fill(0);
    for (const c of circuits) {
      const per = c.loadVA / c.slots.length;
      for (const s of c.slots) totals[phaseOfPosition(s)] += per;
    }
    return totals;
  }, [circuits, phaseCount]);

  const totalVA = phaseTotals.reduce((a, b) => a + b, 0);
  const maxPhase = Math.max(...phaseTotals, 0);
  const minPhase = Math.min(...phaseTotals, 0);
  const imbalance = maxPhase > 0 ? ((maxPhase - minPhase) / maxPhase) * 100 : 0;

  const circuitAt = (pos: number) => circuits.find((c) => c.slots.includes(pos));
  const rows = Math.ceil(capacity / 2);

  /** Build the row/total data shared by CSV, PDF and Excel exports. */
  function exportData() {
    const rows: (string | number)[][] = [];
    for (let pos = 1; pos <= capacity; pos++) {
      const c = circuitAt(pos);
      if (c && c.slots[0] === pos) {
        rows.push([pos, c.desc, c.type, c.loadVA, c.poles, tripFor(c), c.slots.map((s) => PHASE_LABELS[phaseOfPosition(s)]).join("+")]);
      }
    }
    const phaseTotalsFmt = phaseTotals.map((t, i) => ({ label: `Phase ${PHASE_LABELS[i]}`, kva: (t / 1000).toFixed(2) }));
    phaseTotalsFmt.push({ label: "Total", kva: (totalVA / 1000).toFixed(2) });
    return { rows, phaseTotalsFmt };
  }

  function exportCSV() {
    const { rows } = exportData();
    const header = ["Ckt", "Description", "Type", "Load (VA)", "Poles", "Trip (A)", "Phase"];
    const lines = [header.join(","), ...rows.map((r) => [r[0], `"${r[1]}"`, r[2], r[3], r[4], r[5], r[6]].join(","))];
    lines.push("");
    phaseTotals.forEach((t, i) => lines.push(`Phase ${PHASE_LABELS[i]} total (VA),${Math.round(t)}`));
    lines.push(`Total (kVA),${(totalVA / 1000).toFixed(2)}`);
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "panel-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { rows, phaseTotalsFmt } = exportData();
    const { exportPanelPdf } = await import("@/lib/export/pdf");
    await exportPanelPdf({ name: "Panel", voltageLabel: cfg.label, rows, phaseTotals: phaseTotalsFmt });
  }

  async function exportXLSX() {
    const { rows, phaseTotalsFmt } = exportData();
    const { exportPanelExcel } = await import("@/lib/export/excel");
    await exportPanelExcel({ name: "Panel", voltageLabel: cfg.label, rows, phaseTotals: phaseTotalsFmt });
  }

  function Cell({ pos }: { pos: number }) {
    const c = circuitAt(pos);
    const phase = PHASE_LABELS[phaseOfPosition(pos)];
    if (!c) {
      return (
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{pos}</span>
          <span className="opacity-50">— spare —</span>
          <span className="w-4 text-center opacity-50">{phase}</span>
        </div>
      );
    }
    const isStart = c.slots[0] === pos;
    return (
      <div className="flex items-center justify-between gap-1 px-2 py-1.5 text-xs">
        <span className="w-5 font-mono">{pos}</span>
        {isStart ? (
          <>
            <span className="flex-1 truncate font-medium" title={c.desc}>{c.desc}</span>
            <span className="badge border-border px-1.5 py-0 text-[10px]">{tripFor(c)}A/{c.poles}P</span>
            <span className="w-10 text-right font-mono text-muted-foreground">{c.loadVA}</span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">⟂ {c.desc}</span>
        )}
        <span className="w-4 text-center font-semibold text-primary">{phase}</span>
        {isStart && (
          <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-danger" aria-label="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Config + add circuit */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Panel</h2>
          <div className="space-y-3">
            <div>
              <label className="field-label">Voltage / phase</label>
              <select className="field-input" value={voltageKey} onChange={(e) => setVoltageKey(e.target.value)}>
                {VOLTAGES.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Capacity (spaces)</label>
              <select className="field-input" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
                {[12, 24, 30, 42].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Add circuit</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2">
              <label className="field-label">Description</label>
              <input className="field-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Kitchen receptacles" onKeyDown={(e) => e.key === "Enter" && addCircuit()} />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
                {LOAD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Load (VA)</label>
              <input type="number" className="field-input" value={loadVA} onChange={(e) => setLoadVA(e.target.value === "" ? "" : Number(e.target.value))} min={1} />
            </div>
            <div>
              <label className="field-label">Poles</label>
              <select className="field-input" value={poles} onChange={(e) => setPoles(Number(e.target.value) as Poles)}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                {phaseCount === 3 && <option value={3}>3</option>}
              </select>
            </div>
            <button onClick={addCircuit} className="btn-primary col-span-2 sm:col-span-1 sm:self-end">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Phase balance summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {phaseTotals.map((t, i) => (
          <div key={i} className="card p-4">
            <p className="text-xs font-medium text-muted-foreground">Phase {PHASE_LABELS[i]}</p>
            <p className="mt-1 text-xl font-bold">{(t / 1000).toFixed(2)}<span className="ml-1 text-sm text-muted-foreground">kVA</span></p>
          </div>
        ))}
        <div className="card p-4">
          <p className="text-xs font-medium text-muted-foreground">Total / imbalance</p>
          <p className="mt-1 text-xl font-bold">{(totalVA / 1000).toFixed(2)}<span className="ml-1 text-sm text-muted-foreground">kVA</span></p>
          <p className={`text-xs ${imbalance > 15 ? "text-warning" : "text-success"}`}>{imbalance.toFixed(0)}% imbalance</p>
        </div>
      </div>

      {/* Schedule */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Zap className="h-4 w-4 text-primary" /> Panel schedule</h2>
          <div className="flex items-center gap-2">
            <button onClick={exportPDF} className="btn-primary h-8 gap-1.5 px-3 text-xs"><FileDown className="h-3.5 w-3.5" /> PDF</button>
            <button onClick={exportXLSX} className="btn-outline h-8 gap-1.5 px-3 text-xs"><Download className="h-3.5 w-3.5" /> Excel</button>
            <button onClick={exportCSV} className="btn-outline h-8 gap-1.5 px-3 text-xs">CSV</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="divide-y md:border-r">
            <p className="bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Odd (left)</p>
            {Array.from({ length: rows }, (_, i) => <Cell key={i} pos={2 * i + 1} />)}
          </div>
          <div className="divide-y">
            <p className="bg-muted/40 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Even (right)</p>
            {Array.from({ length: rows }, (_, i) => <Cell key={i} pos={2 * i + 2} />)}
          </div>
        </div>
      </div>

      {circuits.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">Add circuits above — they auto-place with odd numbers on the left, even on the right, and balance across phases {PHASE_LABELS.slice(0, phaseCount).join(", ")}.</p>
      )}
      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
        Circuit numbering and phase assignment follow the conventional odd-left / even-right layout. Breaker trip ratings are suggested from the connected load — verify against CEC Rule 14-104 and the actual load type. For reference only.
      </p>
    </div>
  );
}
