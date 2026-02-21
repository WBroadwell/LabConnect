"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { Opportunity } from "@/types";
import {
  Loader2,
  Calendar,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Filter types
interface Filters {
  search: string;
  location: string;
  compensationType: "any" | "paid" | "credit" | "both";
  minPay: number;
  types: string[];
  years: string[];
  startDateAfter: string;
  endDateBefore: string;
}

const OPPORTUNITY_TYPES = ["Research", "Internship", "Part-time", "Full-time", "Volunteer"];
const YEAR_LEVELS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const defaultFilters: Filters = {
  search: "",
  location: "",
  compensationType: "any",
  minPay: 0,
  types: [],
  years: [],
  startDateAfter: "",
  endDateBefore: "",
};

export default function OpportunitiesPage() {
  const {
    canCreateOpportunities,
    isLoading: authLoading,
    isAuthenticated,
    user,
    testUserId,
    savedOpportunityIds,
    addSavedOpportunity,
    removeSavedOpportunity,
  } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [tempFilters, setTempFilters] = useState<Filters>(defaultFilters);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const response = await fetch("/api/opportunities");
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

  const handleSaveToggle = async (opportunityId: string, isSaved: boolean) => {
    if (!user || !testUserId) return;

    setSavingIds((prev) => new Set(prev).add(opportunityId));

    try {
      const response = await fetch(
        `/api/users/${user.id}/saved-opportunities/${opportunityId}`,
        {
          method: isSaved ? "DELETE" : "POST",
          headers: {
            "X-User-Id": testUserId.toString(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update saved opportunity");
      }

      if (isSaved) {
        removeSavedOpportunity(opportunityId);
      } else {
        addSavedOpportunity(opportunityId);
      }
    } catch (err) {
      console.error("Error saving opportunity:", err);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    }
  };

  // Apply filters
  const displayedOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Show saved only
    if (showSavedOnly) {
      filtered = filtered.filter((opp) => savedOpportunityIds.includes(opp.id));
    }

    // Search filter (title and name)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchLower) ||
          opp.name.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (filters.location.trim()) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter((opp) =>
        opp.location.toLowerCase().includes(locationLower)
      );
    }

    // Compensation type filter
    if (filters.compensationType !== "any") {
      filtered = filtered.filter((opp) => {
        const isPaid = opp.hourlyPay > 0;
        const hasCredits = opp.credits && opp.credits.length > 0;

        switch (filters.compensationType) {
          case "paid":
            return isPaid;
          case "credit":
            return hasCredits;
          case "both":
            return isPaid && hasCredits;
          default:
            return true;
        }
      });
    }

    // Minimum pay filter
    if (filters.minPay > 0) {
      filtered = filtered.filter((opp) => opp.hourlyPay >= filters.minPay);
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((opp) => filters.types.includes(opp.type));
    }

    // Year level filter
    if (filters.years.length > 0) {
      filtered = filtered.filter((opp) =>
        opp.years.some((year) => filters.years.includes(year))
      );
    }

    // Start date filter (show opportunities that start on or after this date)
    if (filters.startDateAfter) {
      filtered = filtered.filter((opp) => {
        if (!opp.start_date) return true; // Include opportunities without start date
        return opp.start_date >= filters.startDateAfter;
      });
    }

    // End date filter (show opportunities that end on or before this date)
    if (filters.endDateBefore) {
      filtered = filtered.filter((opp) => {
        if (!opp.end_date) return true; // Include opportunities without end date
        return opp.end_date <= filters.endDateBefore;
      });
    }

    return filtered;
  }, [opportunities, showSavedOnly, savedOpportunityIds, filters]);

  // Count active filters (excluding search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location.trim()) count++;
    if (filters.compensationType !== "any") count++;
    if (filters.minPay > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.startDateAfter) count++;
    if (filters.endDateBefore) count++;
    return count;
  }, [filters]);

  // Get active filter labels for badges
  const activeFilterBadges = useMemo(() => {
    const badges: { key: string; label: string }[] = [];

    if (filters.location.trim()) {
      badges.push({ key: "location", label: `Location: ${filters.location}` });
    }
    if (filters.compensationType !== "any") {
      const labels = { paid: "Paid", credit: "Credit", both: "Paid & Credit" };
      badges.push({ key: "compensationType", label: labels[filters.compensationType] });
    }
    if (filters.minPay > 0) {
      badges.push({ key: "minPay", label: `Min $${filters.minPay}/hr` });
    }
    if (filters.types.length > 0) {
      badges.push({ key: "types", label: `Types: ${filters.types.join(", ")}` });
    }
    if (filters.years.length > 0) {
      badges.push({ key: "years", label: `Years: ${filters.years.join(", ")}` });
    }
    if (filters.startDateAfter) {
      badges.push({ key: "startDateAfter", label: `Starts after: ${filters.startDateAfter}` });
    }
    if (filters.endDateBefore) {
      badges.push({ key: "endDateBefore", label: `Ends before: ${filters.endDateBefore}` });
    }

    return badges;
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsSheetOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilters(defaultFilters);
  };

  const handleClearAllFilters = () => {
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...filters };
    switch (key) {
      case "location":
        newFilters.location = "";
        break;
      case "compensationType":
        newFilters.compensationType = "any";
        break;
      case "minPay":
        newFilters.minPay = 0;
        break;
      case "types":
        newFilters.types = [];
        break;
      case "years":
        newFilters.years = [];
        break;
      case "startDateAfter":
        newFilters.startDateAfter = "";
        break;
      case "endDateBefore":
        newFilters.endDateBefore = "";
        break;
    }
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  const handleOpenSheet = () => {
    setTempFilters(filters);
    setIsSheetOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
          <p className="mt-2 text-muted-foreground">
            Browse available research opportunities at RPI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!authLoading && isAuthenticated && (
            <Button
              variant={showSavedOnly ? "default" : "outline"}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className="gap-2"
            >
              {showSavedOnly ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {showSavedOnly ? "Showing Saved" : "Show Saved Only"}
            </Button>
          )}
          {!authLoading && canCreateOpportunities && (
            <Button asChild>
              <Link href="/opportunities/create">Create Opportunity</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title or lab name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 bg-card"
          />
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2" onClick={handleOpenSheet}>
              <SlidersHorizontal className="h-4 w-4" />
              All Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Opportunities</SheetTitle>
              <SheetDescription>
                Narrow down opportunities based on your preferences.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Location Filter */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Amos Eaton, CII, Remote"
                  value={tempFilters.location}
                  onChange={(e) =>
                    setTempFilters({ ...tempFilters, location: e.target.value })
                  }
                />
              </div>

              {/* Compensation Type */}
              <div className="space-y-3">
                <Label>Compensation</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "any", label: "Any" },
                    { value: "paid", label: "Paid" },
                    { value: "credit", label: "Credit" },
                    { value: "both", label: "Paid & Credit" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        tempFilters.compensationType === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setTempFilters({
                          ...tempFilters,
                          compensationType: option.value as Filters["compensationType"],
                        })
                      }
                      className="justify-center"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Minimum Pay Slider */}
              {(tempFilters.compensationType === "paid" ||
                tempFilters.compensationType === "both" ||
                tempFilters.compensationType === "any") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Minimum Hourly Pay</Label>
                    <span className="text-sm font-medium">
                      ${tempFilters.minPay}/hr
                    </span>
                  </div>
                  <Slider
                    value={[tempFilters.minPay]}
                    onValueChange={(value) =>
                      setTempFilters({ ...tempFilters, minPay: value[0] })
                    }
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$50</span>
                  </div>
                </div>
              )}

              {/* Opportunity Type */}
              <div className="space-y-3">
                <Label>Opportunity Type</Label>
                <div className="space-y-2">
                  {OPPORTUNITY_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={tempFilters.types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTempFilters({
                              ...tempFilters,
                              types: [...tempFilters.types, type],
                            });
                          } else {
                            setTempFilters({
                              ...tempFilters,
                              types: tempFilters.types.filter((t) => t !== type),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Level */}
              <div className="space-y-3">
                <Label>Year Level</Label>
                <div className="space-y-2">
                  {YEAR_LEVELS.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={tempFilters.years.includes(year)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTempFilters({
                              ...tempFilters,
                              years: [...tempFilters.years, year],
                            });
                          } else {
                            setTempFilters({
                              ...tempFilters,
                              years: tempFilters.years.filter((y) => y !== year),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`year-${year}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Filters */}
              <div className="space-y-3">
                <Label>Duration</Label>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="startDateAfter" className="text-sm font-normal">
                      Starts on or after
                    </Label>
                    <Input
                      id="startDateAfter"
                      type="date"
                      value={tempFilters.startDateAfter}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, startDateAfter: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDateBefore" className="text-sm font-normal">
                      Ends on or before
                    </Label>
                    <Input
                      id="endDateBefore"
                      type="date"
                      value={tempFilters.endDateBefore}
                      onChange={(e) =>
                        setTempFilters({ ...tempFilters, endDateBefore: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
              <SheetClose asChild>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Badges */}
      {activeFilterBadges.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilterBadges.map((badge) => (
            <Badge
              key={badge.key}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleRemoveFilter(badge.key)}
            >
              {badge.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {displayedOpportunities.length} of {opportunities.length} opportunities
          {showSavedOnly && " (saved only)"}
        </p>
      )}

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

      {!isLoading &&
        !error &&
        displayedOpportunities.length === 0 &&
        opportunities.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
            {showSavedOnly ? (
              <>
                <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  You haven&apos;t saved any opportunities yet.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click the bookmark icon on any opportunity to save it for later.
                </p>
              </>
            ) : (
              <>
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No opportunities match your filters.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleClearAllFilters}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        )}

      {!isLoading && !error && displayedOpportunities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedOpportunities.map((opportunity) => {
            const isSaved = savedOpportunityIds.includes(opportunity.id);
            const isSaving = savingIds.has(opportunity.id);

            return (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`}>
                <Card className="group relative hover:shadow-md transition-shadow cursor-pointer h-full">
                  {/* Save Button */}
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveToggle(opportunity.id, isSaved);
                      }}
                      disabled={isSaving}
                      className={`absolute right-3 top-3 z-10 rounded-full p-2 transition-all duration-200 ${
                        isSaved
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                      } ${isSaving ? "cursor-wait" : "cursor-pointer"}`}
                      title={isSaved ? "Unsave opportunity" : "Save opportunity"}
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isSaved ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <CardHeader className="pr-14">
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{opportunity.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {opportunity.application_due && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>Due: {opportunity.application_due}</span>
                        </div>
                      )}
                      {opportunity.hourlyPay > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4 shrink-0" />
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
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
