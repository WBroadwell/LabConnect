"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/auth-context";
import { Opportunity } from "@/types";
import { Loader2, MapPin, Calendar, Pencil, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, testUserId } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user's opportunities
  useEffect(() => {
    async function fetchOpportunities() {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${user.id}/opportunities`
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

    if (user?.id) {
      fetchOpportunities();
    }
  }, [user?.id]);

  const handleDelete = async (opportunityId: string) => {
    setDeletingId(opportunityId);
    try {
      const headers: Record<string, string> = {};
      if (testUserId) {
        headers["X-User-Id"] = testUserId.toString();
      }

      const response = await fetch(
        `http://localhost:5000/api/opportunities/${opportunityId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete opportunity");
      }

      // Remove from local state
      setOpportunities((prev) => prev.filter((opp) => opp.id !== opportunityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeletingId(null);
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* User Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {user?.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              <span className="capitalize">{user?.role}</span>
            </p>
            {user?.departments && user.departments.length > 0 && (
              <p>
                <span className="font-medium">Departments:</span>{" "}
                {user.departments.join(", ")}
              </p>
            )}
            {user?.title && (
              <p>
                <span className="font-medium">Title:</span> {user.title}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User's Opportunities */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Opportunities</h2>
        {user?.can_create_opportunities && (
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
          <p className="text-muted-foreground">
            You haven&apos;t created any opportunities yet.
          </p>
        </div>
      )}

      {!isLoading && !error && opportunities.length > 0 && (
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>{opportunity.name}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/opportunities/${opportunity.id}/edit`}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === opportunity.id}
                        >
                          {deletingId === opportunity.id ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due: {opportunity.application_due}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {opportunity.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
