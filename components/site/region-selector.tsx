"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { CODE_STANDARDS } from "@/packages/registry";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "standard";

export function RegionSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("CEC");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCurrent(saved);
    } catch {}
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = CODE_STANDARDS.find((s) => s.id === current) ?? CODE_STANDARDS[0];

  function pick(id: string, available: boolean) {
    if (!available) return;
    setCurrent(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn-outline h-9 gap-1.5 px-3 text-xs sm:text-sm">
        <Globe className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{active.flag}</span>
        <span className="max-w-[9rem] truncate">{active.region}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border bg-card shadow-lg">
          <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Select code standard</p>
          {CODE_STANDARDS.map((s) => (
            <button
              key={s.id}
              onClick={() => pick(s.id, s.available)}
              disabled={!s.available}
              className={cn(
                "flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted",
                !s.available && "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <span className="mt-0.5 flex h-5 w-7 shrink-0 items-center justify-center rounded border text-[10px] font-bold">{s.flag}</span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-medium">
                  {s.region}
                  {s.id === current && <Check className="h-3.5 w-3.5 text-primary" />}
                  {!s.available && <span className="badge border-border text-muted-foreground">Soon</span>}
                </span>
                <span className="block text-xs text-muted-foreground">{s.edition}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
