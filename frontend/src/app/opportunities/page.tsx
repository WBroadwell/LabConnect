"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Opportunity } from "@/types";
import { Loader2, MapPin, Calendar, DollarSign } from "lucide-react";

export default function OpportunitiesPage() {
  const { canCreateOpportunities, isLoading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch("http://localhost:5000/api/opportunities");
        if (!response.ok) {
          throw new Error("Failed to fetch opportunities");
        }
        const data = await response.json();
        setOpportunities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-2 text-muted-foreground">
            Browse available research opportunities at RPI.
          </p>
        </div>
        {!authLoading && canCreateOpportunities && (
          <Button asChild>
            <Link href="/opportunities/create">Create Opportunity</Link>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && opportunities.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">
            No opportunities available yet. Be the first to create one!
          </p>
        </div>
      )}

      {!isLoading && !error && opportunities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{opportunity.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {opportunity.application_due}</span>
                  </div>
                  {opportunity.hourlyPay > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${opportunity.hourlyPay}/hr</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {opportunity.type}
                    </span>
                    {opportunity.credits.length > 0 && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {opportunity.credits.join(", ")} credits
                      </span>
                    )}
                  </div>
                  {opportunity.description && (
                    <p className="pt-2 text-muted-foreground line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
