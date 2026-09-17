import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal, DollarSign, BookUp, Newspaper, FileText, Inbox, BarChart3, Bot, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { features } from "@/lib/config";
import { CATALOG } from "@/packages/registry";
import { getPublishedPosts } from "@/lib/blog/store";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const sections = [
  { href: "/admin/calculators", label: "Calculators", desc: "Enable, reorder & gate tools", icon: <SlidersHorizontal className="h-4 w-4" /> },
  { href: "/admin/pricing", label: "Pricing & limits", desc: "Plans and free-tier caps", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/admin/code-standards", label: "Code standards", desc: "Upload & ingest code books", icon: <BookUp className="h-4 w-4" /> },
  { href: "/admin/blog", label: "Blog", desc: "Write & manage posts", icon: <Newspaper className="h-4 w-4" /> },
  { href: "/admin/content", label: "Content", desc: "Hero, contact & footer copy", icon: <FileText className="h-4 w-4" /> },
  { href: "/admin/leads", label: "Leads", desc: "Contact & hire requests", icon: <Inbox className="h-4 w-4" /> },
  { href: "/admin/analytics", label: "Analytics", desc: "Usage & conversions", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/admin/ai", label: "AI assistant", desc: "Prompt, model & logs", icon: <Bot className="h-4 w-4" /> },
];

export default async function AdminPage() {
  const liveCalcs = CATALOG.filter((c) => c.status === "live").length;
  const posts = await getPublishedPosts();
  const stats = [
    { label: "Total users", value: "—" },
    { label: "Active subscriptions", value: "—" },
    { label: "MRR", value: "—" },
    { label: "Live calculators", value: String(liveCalcs) },
    { label: "Published posts", value: String(posts.length) },
  ];

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Control calculators, pricing, code standards, content, leads and the AI assistant."
      nav={adminNav("/admin")}
      banner={
        !features.db && (
          <div className="mb-6 rounded-lg border border-dashed bg-surface px-4 py-3 text-sm text-muted-foreground">
            Preview — connect a database (DATABASE_URL) and sign in as an admin to make every action live. All sections below are navigable now.
          </div>
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">Manage</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="group card flex items-center gap-3 p-4 transition hover:border-primary/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{s.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold group-hover:text-primary">{s.label}</span>
              <span className="block text-xs text-muted-foreground">{s.desc}</span>
            </span>
            <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
