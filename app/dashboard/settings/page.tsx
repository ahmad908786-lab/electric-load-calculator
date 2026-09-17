"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";
import { CODE_STANDARDS } from "@/packages/registry";

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const [region, setRegion] = useState("CEC");
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {});
    try {
      setRegion(localStorage.getItem("standard") || "CEC");
      setTheme(localStorage.getItem("theme") || "system");
    } catch {}
  }, []);

  function saveRegion(v: string) {
    setRegion(v);
    try { localStorage.setItem("standard", v); } catch {}
  }
  function saveTheme(v: string) {
    setTheme(v);
    try {
      if (v === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", v);
    } catch {}
    const dark = v === "dark" || (v === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }

  return (
    <DashboardShell title="Settings" subtitle="Your profile and preferences." nav={userNav("/dashboard/settings")}>
      <div className="max-w-xl space-y-6">
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold">Profile</h2>
          {user ? (
            <div className="space-y-3">
              <label className="block"><span className="field-label">Name</span><input className="field-input" defaultValue={user.name ?? ""} /></label>
              <label className="block"><span className="field-label">Email</span><input className="field-input" defaultValue={user.email} disabled /></label>
              <button className="btn-primary">Save profile</button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary">Sign in</Link> to manage your profile.
            </p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold">Preferences</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="field-label">Default code standard</span>
              <select className="field-input" value={region} onChange={(e) => saveRegion(e.target.value)}>
                {CODE_STANDARDS.map((s) => <option key={s.id} value={s.id} disabled={!s.available}>{s.region} — {s.edition}{s.available ? "" : " (soon)"}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="field-label">Theme</span>
              <select className="field-input" value={theme} onChange={(e) => saveTheme(e.target.value)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
