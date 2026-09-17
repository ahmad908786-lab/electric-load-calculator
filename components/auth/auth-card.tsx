"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { signInAction, signUpAction, type ActionResult } from "@/app/actions/auth";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const action = isSignup ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  useEffect(() => {
    if (state?.ok) router.push("/dashboard");
  }, [state, router]);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignup ? "Start with 3 free calculations every month." : "Sign in to your VoltCalc dashboard."}
          </p>
        </div>

        <form action={formAction} className="space-y-3">
          {isSignup && (
            <div>
              <label className="field-label">Name</label>
              <input name="name" className="field-input" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="field-label">Email</label>
            <input name="email" type="email" className="field-input" required placeholder="you@company.com" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input name="password" type="password" className="field-input" required placeholder="••••••••" minLength={8} />
          </div>
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        {state?.error && (
          <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-foreground">{state.error}</p>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account? " : "New to VoltCalc? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-primary">
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
}
