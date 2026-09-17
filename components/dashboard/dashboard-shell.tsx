import Link from "next/link";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  children,
  banner,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: ReactNode;
  banner?: ReactNode;
}) {
  return (
    <div className="container-page py-8">
      {banner}
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${n.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                {n.icon}
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
