"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User as UserIcon,
  Loader2,
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  Calendar,
  Briefcase,
} from "lucide-react";
import { type User, type Opportunity } from "@/types";

export default function ProfessorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const professorId = params.id as string;
  const [professor, setProfessor] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfessorData() {
      try {
        // Fetch professor details
        const profResponse = await fetch(
          `/api/professors/${professorId}`
        );
        if (!profResponse.ok) {
          if (profResponse.status === 404) {
            setError("Professor not found");
          } else {
            throw new Error("Failed to fetch professor");
          }
          return;
        }
        const profData = await profResponse.json();
        setProfessor(profData);

        // Fetch professor's opportunities
        const oppResponse = await fetch(
          `/api/users/${professorId}/opportunities`
        );
        if (oppResponse.ok) {
          const oppData = await oppResponse.json();
          setOpportunities(oppData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessorData();
  }, [professorId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">{error || "Professor not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Professor Profile Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-linear-to-r from-primary/20 via-primary/10 to-transparent h-24" />
        <CardContent className="relative pb-6">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-6">
            <div className="h-24 w-24 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg">
              {professor.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={professor.profile_picture}
                  alt={professor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <UserIcon className="h-12 w-12 text-primary/40" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="ml-32 pt-2">
            <h1 className="text-2xl font-bold">{professor.name}</h1>
            {professor.title && (
              <p className="text-muted-foreground">{professor.title}</p>
            )}

            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-4 text-sm">
                <a
                  href={`mailto:${professor.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {professor.email}
                </a>
                {professor.departments && professor.departments.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {professor.departments.join(", ")}
                  </div>
                )}
                {professor.office && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {professor.office}
                  </div>
                )}
                {professor.website && (
                  <a
                    href={professor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              {professor.research_interests && professor.research_interests.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Research Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {professor.research_interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Research Opportunities
        </h2>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {opportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 h-full">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base leading-snug">{opportunity.title}</CardTitle>
                    <CardDescription className="text-xs">{opportunity.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {opportunity.location}
                      </div>
                      {opportunity.application_due && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {opportunity.application_due}
                        </div>
                      )}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        {opportunity.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              No research opportunities posted yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
