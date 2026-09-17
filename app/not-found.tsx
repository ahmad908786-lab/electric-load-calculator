import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Zap className="h-7 w-7" />
      </span>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist. Try the calculators or head back home.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">Home</Link>
        <Link href="/calculators" className="btn-outline">All calculators</Link>
      </div>
    </div>
  );
}
