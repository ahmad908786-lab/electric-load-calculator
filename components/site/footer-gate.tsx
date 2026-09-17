"use client";

import { usePathname } from "next/navigation";

/** Hides the site footer on the full-screen assistant page. */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/assistant")) return null;
  return <>{children}</>;
}
