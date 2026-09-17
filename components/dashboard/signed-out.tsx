import Link from "next/link";
import { LogIn } from "lucide-react";
import { DashboardShell, type NavItem } from "./dashboard-shell";

/** Shown on a user-dashboard section when nobody is signed in. */
export function SignedOut({ title, nav }: { title: string; nav: NavItem[] }) {
  return (
    <DashboardShell title={title} subtitle="Sign in to view this section." nav={nav}>
      <div className="card flex flex-col items-center gap-3 p-10 text-center">
        <LogIn className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Sign in to access your {title.toLowerCase()}.</p>
        <div className="flex gap-2">
          <Link href="/login" className="btn-primary">Sign in</Link>
          <Link href="/signup" className="btn-outline">Create account</Link>
        </div>
      </div>
    </DashboardShell>
  );
}
