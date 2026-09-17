"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { RegionSelector } from "./region-selector";
import { signOutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/calculators", label: "Calculators" },
  { href: "/panel-schedule", label: "Panel Schedule" },
  { href: "/assistant", label: "AI Assistant" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

interface Me {
  name: string | null;
  email: string;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  async function signOut() {
    await signOutAction();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Volt<span className="text-primary">Calc</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="btn-ghost h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><RegionSelector /></div>
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost hidden h-9 gap-1.5 px-3 text-sm sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button onClick={signOut} className="btn-outline hidden h-9 gap-1.5 px-3 text-sm sm:inline-flex" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden h-9 px-3 text-sm sm:inline-flex">Sign in</Link>
              <Link href="/signup" className="btn-primary hidden h-9 sm:inline-flex">Start free</Link>
            </>
          )}
          <button className="btn-ghost h-9 w-9 p-0 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="btn-ghost justify-start">{n.label}</Link>
            ))}
            <div className="my-2 flex items-center gap-2"><RegionSelector /></div>
            {user ? (
              <div className="flex gap-2">
                <Link href="/dashboard" className="btn-outline flex-1" onClick={() => setOpen(false)}>Dashboard</Link>
                <button onClick={signOut} className="btn-outline flex-1">Sign out</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>Sign in</Link>
                <Link href="/signup" className="btn-primary flex-1" onClick={() => setOpen(false)}>Start free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
