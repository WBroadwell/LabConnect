"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeCodeForToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");

      if (!code) {
        setError("No authentication code provided");
        return;
      }

      try {
        await exchangeCodeForToken(code);
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    }

    handleCallback();
  }, [searchParams, exchangeCodeForToken, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-destructive mb-2">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-primary hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
