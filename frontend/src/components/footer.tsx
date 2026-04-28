"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

function ProfessorCodeEntry({ onUpgraded }: { onUpgraded: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function getCsrfToken() {
    const match = document.cookie.match(/csrf_access_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/claim-professor", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrfToken() },
        credentials: "include",
        body: JSON.stringify({ professor_code: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply code");
      onUpgraded();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply code");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary-foreground/60 hover:text-primary-foreground underline underline-offset-2"
      >
        Faculty? Enter your professor code
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <p className="text-xs text-primary-foreground/80 font-medium">Enter your professor confirmation code</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXXXXXX"
          maxLength={8}
          required
          className="w-32 rounded border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-1 text-center font-mono text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-foreground/50"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-primary-foreground px-3 py-1 text-xs font-medium text-primary hover:bg-primary-foreground/90 disabled:opacity-50"
        >
          {submitting ? "..." : "Apply"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); setCode(""); }}
          className="text-xs text-primary-foreground/60 hover:text-primary-foreground"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </form>
  );
}

export function Footer() {
  const { user, refreshUser } = useAuth();

  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-primary-foreground/80">
            <span className="font-semibold text-primary-foreground">
              LabConnect
            </span>{" "}
            is an open source project developed by{" "}
            <Link
              href="https://new.rcos.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/70"
            >
              RCOS
            </Link>{" "}
            at{" "}
            <Link
              href="https://rpi.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/70"
            >
              Rensselaer Polytechnic Institute
            </Link>
            .
          </p>
          <p className="text-xs text-primary-foreground/70">
            Connecting students with research opportunities across campus.
          </p>
          <div className="flex gap-4 text-sm text-primary-foreground/70">
            <Link
              href="https://github.com/WBroadwell/LabConnect"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground"
            >
              GitHub
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-primary-foreground">
              About
            </Link>
          </div>
          {user?.role === "student" && (
            <ProfessorCodeEntry onUpgraded={refreshUser} />
          )}
          <p className="text-xs text-primary-foreground/70">
            &copy; {new Date().getFullYear()} LabConnect Team.
            Open source under{" "}
            <Link
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-primary-foreground"
            >
              AGPL-3.0 License
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
