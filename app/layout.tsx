import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FooterGate } from "@/components/site/footer-gate";
import { APP_URL } from "@/lib/config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Electrical load calculations, panel schedules, cable sizing and voltage drop — compliant with the Canadian Electrical Code (CEC/OESC), with an AI assistant that cites the code book.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "VoltCalc — Code-Compliant Electrical Calculators & AI Code Search",
    template: "%s · VoltCalc",
  },
  description,
  openGraph: {
    title: "VoltCalc — Code-Compliant Electrical Calculators",
    description,
    type: "website",
    siteName: "VoltCalc",
  },
  twitter: { card: "summary_large_image", title: "VoltCalc", description },
};

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <FooterGate><SiteFooter /></FooterGate>
      </body>
    </html>
  );
}
