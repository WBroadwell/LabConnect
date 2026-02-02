"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function OpportunitiesPage() {
  const { canCreateOpportunities, isLoading } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-2 text-muted-foreground">
            Browse available research opportunities at RPI.
          </p>
        </div>
        {!isLoading && canCreateOpportunities && (
          <Button asChild>
            <Link href="/opportunities/create">Create Opportunity</Link>
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">
          No opportunities available yet. Be the first to create one!
        </p>
      </div>
    </div>
  );
}
