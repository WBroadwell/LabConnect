"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, Loader2, Building2, Mail } from "lucide-react";
import { type User } from "@/types";

interface DepartmentData {
  name: string;
  description: string;
  professors: User[];
}

export default function DepartmentPage() {
  const params = useParams();
  const departmentParam = params.department as string;
  const [department, setDepartment] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepartment() {
      try {
        const response = await fetch(
          `/api/departments/${departmentParam}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setError("Department not found");
          } else {
            throw new Error("Failed to fetch department");
          }
          return;
        }
        const data = await response.json();
        setDepartment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDepartment();
  }, [departmentParam]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/departments">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Departments
          </Button>
        </Link>
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">{error || "Department not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/departments">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{department.name}</h1>
            <p className="text-muted-foreground">
              {department.professors.length} professor{department.professors.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {department.description && (
          <p className="text-muted-foreground max-w-3xl">{department.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Faculty</h2>
        {department.professors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {department.professors.map((professor) => (
              <Link key={professor.id} href={`/professors/${professor.id}`}>
                <Card className="overflow-hidden h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">
                          {professor.name}
                        </CardTitle>
                        {professor.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {professor.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {professor.email}
                    </div>
                    {professor.office && (
                      <p className="text-sm text-muted-foreground">
                        Office: {professor.office}
                      </p>
                    )}
                    {professor.research_interests && professor.research_interests.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Research Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {professor.research_interests.slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {interest}
                            </span>
                          ))}
                          {professor.research_interests.length > 3 && (
                            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{professor.research_interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">
              No professors registered in this department yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
