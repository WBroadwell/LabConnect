"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { type Opportunity, type User } from "@/types";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Building2,
  Mail,
  ExternalLink,
  Users,
  User as UserIcon,
} from "lucide-react";

export default function OpportunityDetailPage() {
  const params = useParams();
  const opportunityId = params.id as string;
  const {
    user,
    isAuthenticated,
    testUserId,
    savedOpportunityIds,
    addSavedOpportunity,
    removeSavedOpportunity,
  } = useAuth();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [professorData, setProfessorData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Opportunity not found");
          } else {
            throw new Error("Failed to fetch opportunity");
          }
          return;
        }
        const data = await response.json();
        setOpportunity(data);

        if (data.creator?.id) {
          try {
            const profResponse = await fetch(
              `/api/professors/${data.creator.id}`
            );
            if (profResponse.ok) {
              const profData = await profResponse.json();
              setProfessorData(profData);
            }
          } catch {
            // Professor data is supplementary; don't fail the page
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOpportunity();
  }, [opportunityId]);

  const isSaved = savedOpportunityIds.includes(opportunityId);
  const isCreator =
    user &&
    opportunity &&
    (opportunity.created_by_id === user.id || user.is_admin);

  const handleSaveToggle = async () => {
    if (!user || !testUserId) return;
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/users/${user.id}/saved-opportunities/${opportunityId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: { "X-User-Id": testUserId.toString() },
        }
      );
      if (!response.ok) throw new Error("Failed to update saved opportunity");
      if (isSaved) {
        removeSavedOpportunity(opportunityId);
      } else {
        addSavedOpportunity(opportunityId);
      }
    } catch (err) {
      console.error("Error saving opportunity:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/opportunities">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Button>
        </Link>
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">
            {error || "Opportunity not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/opportunities">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left sidebar - Professor info */}
        {opportunity.creator && (
          <div>
            <Card>
              <CardContent className="pt-6">
                {/* Profile picture */}
                <div className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-border bg-muted overflow-hidden">
                  {professorData?.profile_picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={professorData.profile_picture}
                      alt={opportunity.creator.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <UserIcon className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Name and info */}
                <div className="text-center">
                  <Link
                    href={`/professors/${opportunity.creator.id}`}
                    className="text-lg font-semibold hover:text-primary hover:underline"
                  >
                    {opportunity.creator.name}
                  </Link>
                  {(professorData?.title || opportunity.creator.title) && (
                    <p className="text-sm text-muted-foreground">
                      {professorData?.title || opportunity.creator.title}
                    </p>
                  )}
                  {opportunity.creator.departments.length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {opportunity.creator.departments.join(", ")}
                    </div>
                  )}
                </div>

                {/* Email */}
                <a
                  href={`mailto:${opportunity.creator.email}`}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {opportunity.creator.email}
                </a>

                {/* View Profile link */}
                <Link href={`/professors/${opportunity.creator.id}`}>
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Full Profile
                  </Button>
                </Link>

                {/* Recommended Majors */}
                {opportunity.recommended_majors?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Recommended Majors</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.recommended_majors.map((major) => (
                        <span
                          key={major}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {major}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right content - Opportunity details */}
        <div className="space-y-6">
          {/* Combined header + details card */}
          <Card className="overflow-hidden">
            <div className="bg-linear-to-r from-primary/15 via-primary/5 to-transparent h-2" />
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {opportunity.type}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                  <p className="mt-1 text-muted-foreground">
                    {opportunity.name}
                  </p>
                </div>
                {isAuthenticated && !isCreator && (
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                    size="sm"
                    className="gap-2 shrink-0"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {(opportunity.hourlyPay > 0 || opportunity.credits.length > 0) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compensation</p>
                      <p className="font-medium">
                        {[
                          opportunity.hourlyPay > 0 ? `$${opportunity.hourlyPay}/hr` : null,
                          opportunity.credits.length > 0 ? `${opportunity.credits.join(", ")} credits` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.application_due && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Application Due</p>
                      <p className="font-medium">{opportunity.application_due}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{opportunity.location}</p>
                  </div>
                </div>

                {(opportunity.start_date || opportunity.end_date) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {opportunity.start_date && opportunity.end_date
                          ? `${opportunity.start_date} - ${opportunity.end_date}`
                          : opportunity.start_date
                            ? `Starts: ${opportunity.start_date}`
                            : `Ends: ${opportunity.end_date}`}
                      </p>
                    </div>
                  </div>
                )}

                {opportunity.years.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Eligible Years</p>
                      <p className="font-medium">{opportunity.years.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {opportunity.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {opportunity.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommended Experience */}
          {opportunity.recommended_experience && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recommended Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {opportunity.recommended_experience}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
