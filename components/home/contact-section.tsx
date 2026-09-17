"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Wrench } from "lucide-react";

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [type, setType] = useState("hire");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="border-t bg-surface">
      <div className="container-page grid gap-10 py-16 md:grid-cols-2">
        <div>
          <span className="badge border-accent/40 bg-accent/10 text-accent-foreground dark:text-accent">
            <Wrench className="h-3 w-3" /> Need it done for you?
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">Hire our engineers for your calculations</h2>
          <p className="mt-3 text-muted-foreground">
            Load calculations, panel schedules, service upgrades, permit-ready electrical designs — stamped where required.
            Send us your project and we&apos;ll get back within one business day.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {["Residential & commercial load calculations", "Panel schedules & single-line diagrams", "Code-compliance reviews (CEC / OESC)", "Voltage-drop & cable-sizing studies"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> Or email us directly at <a href="mailto:hello@voltcalc.app" className="font-medium text-primary">hello@voltcalc.app</a>
          </p>
        </div>

        <div className="card p-6">
          {status === "sent" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <h3 className="text-lg font-semibold">Thanks — we&apos;ll be in touch</h3>
              <p className="text-sm text-muted-foreground">Your request has been received. We reply within one business day.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex gap-2">
                {[
                  { v: "hire", l: "Hire us" },
                  { v: "support", l: "Support" },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => setType(t.v)}
                    className={`btn h-9 flex-1 ${type === t.v ? "bg-primary text-primary-foreground" : "border bg-transparent hover:bg-muted"}`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
              <div>
                <label className="field-label">Name</label>
                <input name="name" required className="field-input" placeholder="Your name" />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input name="email" type="email" required className="field-input" placeholder="you@company.com" />
              </div>
              <div>
                <label className="field-label">Project / question</label>
                <textarea name="message" required rows={4} className="field-input resize-none" placeholder="Tell us about your project…" />
              </div>
              <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
                {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send request"}
              </button>
              {status === "error" && <p className="text-sm text-danger">Something went wrong. Please email us instead.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
