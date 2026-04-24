"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { type Opportunity } from "@/types";
import { RPI_DEPARTMENTS } from "@/lib/constants";
import {
  Loader2,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Camera,
  User as UserIcon,
  Bookmark,
  BookmarkCheck,
  Building2,
  Mail,
  GraduationCap,
  Briefcase,
  Eye,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, testUserId, refreshUser } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unsavingId, setUnsavingId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editDepartment, setEditDepartment] = useState("");
  const [editOffice, setEditOffice] = useState("");
  const [editResearchInterests, setEditResearchInterests] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize edit form when user loads
  useEffect(() => {
    if (user) {
      setEditDepartment(user.departments?.[0] || "");
      setEditOffice(user.office || "");
      setEditResearchInterests(user.research_interests?.join(", ") || "");
    }
  }, [user]);

  // Fetch user's created opportunities (for professors)
  useEffect(() => {
    async function fetchCreatedOpportunities() {
      if (!user?.id || !isProfessor) return;

      try {
        const response = await fetch(
          `/api/users/${user.id}/opportunities`
        );
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

    const canCreate = user?.role === "professor" || user?.is_admin;
    if (user?.id && canCreate) {
      fetchCreatedOpportunities();
    } else if (user?.id) {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, user?.is_admin]);

  // Fetch saved opportunities (for students)
  useEffect(() => {
    async function fetchSavedOpportunities() {
      if (!user?.id || !testUserId) return;

      try {
        const response = await fetch(
          `/api/users/${user.id}/saved-opportunities`,
          {
            headers: {
              "X-User-Id": testUserId.toString(),
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch saved opportunities");
        }
        const data = await response.json();
        setSavedOpportunities(data);
      } catch (err) {
        console.error("Error fetching saved opportunities:", err);
      }
    }

    if (user?.id && testUserId) {
      fetchSavedOpportunities();
    }
  }, [user?.id, testUserId]);

  const handleDelete = async (opportunityId: string) => {
    setDeletingId(opportunityId);
    try {
      const headers: Record<string, string> = {};
      if (testUserId) {
        headers["X-User-Id"] = testUserId.toString();
      }

      const response = await fetch(
        `/api/opportunities/${opportunityId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete opportunity");
      }

      setOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUnsave = async (opportunityId: string) => {
    if (!user || !testUserId) return;

    setUnsavingId(opportunityId);
    try {
      const response = await fetch(
        `/api/users/${user.id}/saved-opportunities/${opportunityId}`,
        {
          method: "DELETE",
          headers: {
            "X-User-Id": testUserId.toString(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unsave opportunity");
      }

      setSavedOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));
    } catch (err) {
      console.error("Error unsaving opportunity:", err);
    } finally {
      setUnsavingId(null);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !testUserId) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        setIsUpdatingProfile(true);
        const response = await fetch(
          `/api/users/${user.id}/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-User-Id": testUserId.toString(),
            },
            body: JSON.stringify({ profile_picture: base64 }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update profile picture");
        }

        await refreshUser();
      } catch (err) {
        console.error("Error updating profile picture:", err);
      } finally {
        setIsUpdatingProfile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user || !testUserId) return;

    try {
      setIsUpdatingProfile(true);

      // Parse research interests from comma-separated string
      const researchInterests = editResearchInterests
        .split(",")
        .map((interest) => interest.trim())
        .filter((interest) => interest.length > 0);

      const updateData: Record<string, unknown> = {
        departments: editDepartment ? [editDepartment] : [],
      };

      // Only include professor-specific fields for professors
      if (user.role === "professor" || user.is_admin) {
        updateData.office = editOffice;
        updateData.research_interests = researchInterests;
      }

      const response = await fetch(
        `/api/users/${user.id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": testUserId.toString(),
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await refreshUser();
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const isProfessor = user?.role === "professor" || user?.is_admin;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span>Previewing your public profile — this is what others see</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setPreviewMode(false)}>
            Exit Preview
          </Button>
        </div>
      )}

      {/* Profile Header Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-linear-to-r from-primary/20 via-primary/10 to-transparent h-32" />
        <CardContent className="relative pb-6">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg">
                {user?.profile_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <UserIcon className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </div>
              {!previewMode && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdatingProfile}
                    className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="ml-40 pt-4">
            {!isEditingProfile ? (
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    {isProfessor ? (
                      <Briefcase className="h-4 w-4" />
                    ) : (
                      <GraduationCap className="h-4 w-4" />
                    )}
                    <span className="capitalize">
                      {user?.title || user?.role}
                    </span>
                    {user?.is_admin && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                {!previewMode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Public View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={editDepartment} onValueChange={setEditDepartment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {RPI_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isProfessor && (
                  <>
                    <div>
                      <Label htmlFor="office">Office</Label>
                      <Input
                        id="office"
                        value={editOffice}
                        onChange={(e) => setEditOffice(e.target.value)}
                        placeholder="e.g., Lally 123"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="research_interests">Research Interests</Label>
                      <Input
                        id="research_interests"
                        value={editResearchInterests}
                        onChange={(e) => setEditResearchInterests(e.target.value)}
                        placeholder="e.g., Machine Learning, Data Science, AI"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate multiple interests with commas
                      </p>
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={isUpdatingProfile}>
                    {isUpdatingProfile && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!isEditingProfile && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                  {user?.departments && user.departments.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {user.departments.join(", ")}
                    </div>
                  )}
                  {isProfessor && user?.office && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {user.office}
                    </div>
                  )}
                </div>
                {isProfessor && user?.research_interests && user.research_interests.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs text-muted-foreground mb-2">Research Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.research_interests.map((interest, idx) => (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content based on role */}
      {isProfessor ? (
        // Professor: Show created opportunities
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Posted Opportunities</h2>
              
            </div>
            {user?.can_create_opportunities && !previewMode && (
              <Button asChild>
                <Link href="/opportunities/create">Create New</Link>
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
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                You haven&apos;t created any opportunities yet.
              </p>
              <Button asChild className="mt-4">
                <Link href="/opportunities/create">Create Your First Opportunity</Link>
              </Button>
            </div>
          )}

          {!isLoading && !error && opportunities.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {opportunities.map((opportunity) => (
                <Card
                  key={opportunity.id}
                  className="h-full cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/opportunities/${opportunity.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-lg leading-snug">{opportunity.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{opportunity.name}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                        {opportunity.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {opportunity.application_due && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        Due: {opportunity.application_due}
                      </div>
                    )}
                    {!previewMode && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/opportunities/${opportunity.id}/edit`)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === opportunity.id}
                            >
                              {deletingId === opportunity.id ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-3 w-3" />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{opportunity.title}&quot;?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(opportunity.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : previewMode ? (
        // Student preview: saved list is private
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">Saved opportunities are private and not visible to others.</p>
        </div>
      ) : (
        // Student: Show saved opportunities
        <>
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookmarkCheck className="h-6 w-6" />
              Saved Opportunities
            </h2>
            <p className="text-muted-foreground text-sm">
              Opportunities you&apos;ve bookmarked for later
            </p>
          </div>

          {savedOpportunities.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
              <Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                You haven&apos;t saved any opportunities yet.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse opportunities and click the bookmark icon to save them here.
              </p>
              <Button asChild className="mt-4">
                <Link href="/opportunities">Browse Opportunities</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="group relative">
                  <button
                    onClick={() => handleUnsave(opportunity.id)}
                    disabled={unsavingId === opportunity.id}
                    className="absolute right-3 top-3 z-10 rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-105"
                    title="Remove from saved"
                  >
                    {unsavingId === opportunity.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookmarkCheck className="h-4 w-4" />
                    )}
                  </button>
                  <CardHeader className="pr-14">
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>{opportunity.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Due: {opportunity.application_due}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {opportunity.type}
                        </span>
                        {opportunity.credits?.length > 0 && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                            {opportunity.credits.join(", ")} credits
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
