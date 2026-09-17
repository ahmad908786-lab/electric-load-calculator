import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";
import { SignedOut } from "@/components/dashboard/signed-out";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard · Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return <SignedOut title="Projects" nav={userNav("/dashboard/projects")} />;

  const db = getDb();
  const projects = db ? await db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { calculations: true, panels: true } } } }) : [];

  return (
    <DashboardShell title="Projects" subtitle="Group calculations and panel schedules by job." nav={userNav("/dashboard/projects")}>
      {projects.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No projects yet. Create one to organize a job&apos;s calculations and panel schedules.</p>
          <button className="btn-primary mt-1 h-9">New project</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="card p-5">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p._count.calculations} calculations · {p._count.panels} panels</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
