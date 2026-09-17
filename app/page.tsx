import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, ListChecks, ShieldCheck } from "lucide-react";
import { ChatBox } from "@/components/chat/chat-box";
import { CalculatorDirectory } from "@/components/home/calculator-directory";
import { ContactSection } from "@/components/home/contact-section";
import { PostCard } from "@/components/blog/post-card";
import { getPublishedPosts } from "@/lib/blog/store";
import { CATALOG } from "@/packages/registry";

const liveCount = CATALOG.filter((c) => c.status === "live").length;

const FEATURES = [
  { icon: <BookOpen className="h-5 w-5" />, title: "Every result cites the code", body: "Conductor sizes, breakers and loads come with the exact CEC table or rule number — inline and in the report." },
  { icon: <ListChecks className="h-5 w-5" />, title: "Transparent, defensible steps", body: "See each derating factor and demand step, not just a final number. Built for review and permit submissions." },
  { icon: <Cpu className="h-5 w-5" />, title: "AI code search", body: "Ask a plain-language question and get an answer grounded in the electrical code, with references you can check." },
  { icon: <ShieldCheck className="h-5 w-5" />, title: "Code-selectable by region", body: "Start with the Canadian Electrical Code (CEC/OESC). Switch regions as we add NEC and more." },
];

export default async function Home() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  return (
    <>
      {/* Hero */}
      <section id="ai" className="border-b bg-gradient-to-b from-surface to-background">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="badge border-primary/30 bg-primary/10 text-primary">
              Canadian Electrical Code · CEC 2021 / OESC
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Electrical calculations that <span className="text-primary">cite the code</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Load calcs, panel schedules, cable sizing and voltage drop — each answer backed by the exact CEC rule.
              Plus an AI assistant that searches the electrical code book for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/calculators" className="btn-primary h-11 px-5">
                Explore calculators <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/panel-schedule" className="btn-outline h-11 px-5">Build a panel schedule</Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{liveCount}</strong> calculators live</span>
              <span><strong className="text-foreground">3</strong> free calculations / month</span>
              <span><strong className="text-foreground">Inline</strong> code citations</span>
            </div>
          </div>
          <div className="lg:pl-6">
            <ChatBox />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{f.icon}</span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator directory */}
      <section className="border-t bg-surface">
        <div className="container-page py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">The complete electrical toolbox</h2>
              <p className="mt-2 text-muted-foreground">Load calculation, sizing, power analysis, panel schedules and conversions — all in one place.</p>
            </div>
            <Link href="/calculators" className="btn-outline">View all</Link>
          </div>
          <CalculatorDirectory />
        </div>
      </section>

      {/* Latest from the blog */}
      {posts.length > 0 && (
        <section className="container-page py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">From the blog</h2>
              <p className="mt-2 text-muted-foreground">Guides and explainers on electrical design and the Canadian Electrical Code.</p>
            </div>
            <Link href="/blog" className="btn-outline">All posts</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}

      {/* Contact / hire */}
      <ContactSection />
    </>
  );
}
