import {
  Shield, SlidersHorizontal, DollarSign, BookUp, Newspaper, FileText, Inbox, BarChart3, Bot,
  LayoutDashboard, FolderKanban, History, MessageSquare, CreditCard, Settings,
} from "lucide-react";
import type { NavItem } from "./dashboard-shell";

const cls = "h-4 w-4";

const ADMIN: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/admin", label: "Overview", icon: <Shield className={cls} /> },
  { href: "/admin/calculators", label: "Calculators", icon: <SlidersHorizontal className={cls} /> },
  { href: "/admin/pricing", label: "Pricing", icon: <DollarSign className={cls} /> },
  { href: "/admin/code-standards", label: "Code standards", icon: <BookUp className={cls} /> },
  { href: "/admin/blog", label: "Blog", icon: <Newspaper className={cls} /> },
  { href: "/admin/content", label: "Content", icon: <FileText className={cls} /> },
  { href: "/admin/leads", label: "Leads", icon: <Inbox className={cls} /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className={cls} /> },
  { href: "/admin/ai", label: "AI", icon: <Bot className={cls} /> },
];

const USER: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className={cls} /> },
  { href: "/dashboard/projects", label: "Projects", icon: <FolderKanban className={cls} /> },
  { href: "/dashboard/history", label: "History", icon: <History className={cls} /> },
  { href: "/dashboard/chats", label: "AI chats", icon: <MessageSquare className={cls} /> },
  { href: "/dashboard/billing", label: "Billing", icon: <CreditCard className={cls} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings className={cls} /> },
];

export function adminNav(active: string): NavItem[] {
  return ADMIN.map((i) => ({ ...i, active: i.href === active }));
}
export function userNav(active: string): NavItem[] {
  return USER.map((i) => ({ ...i, active: i.href === active }));
}
