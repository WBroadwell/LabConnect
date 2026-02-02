"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RPI_DEPARTMENTS, type User } from "@/types";
import { Search, User as UserIcon, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

type ProfessorsByDepartment = Record<string, User[]>;

export default function ProfessorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set(RPI_DEPARTMENTS)
  );
  const [professorsByDept, setProfessorsByDept] = useState<ProfessorsByDepartment>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfessors() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/professors?group_by_department=true"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch professors");
        }
        const data = await response.json();
        setProfessorsByDept(data.departments || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfessors();
  }, []);

  const toggleDepartment = (dept: string) => {
    setExpandedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };

  // Show all RPI departments, but indicate which ones have professors
  const filteredDepartments = RPI_DEPARTMENTS.filter((dept) => {
    const deptMatches = dept.toLowerCase().includes(searchQuery.toLowerCase());
    const professors = professorsByDept[dept] || [];
    const profMatches = professors.some((prof) =>
      prof.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return deptMatches || profMatches;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Professors</h1>
        <p className="mt-2 text-muted-foreground">
          Browse professors by department and discover research opportunities.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search departments or professors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Professor data will be populated when users register through RPI SSO authentication.
          Departments are shown based on professor registrations.
        </p>
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

      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredDepartments.map((department) => {
            const professors = professorsByDept[department] || [];
            const isExpanded = expandedDepartments.has(department);
            const filteredProfessors = searchQuery
              ? professors.filter((prof) =>
                  prof.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : professors;

          return (
            <Card key={department} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer bg-muted/50 py-4 hover:bg-muted/70 transition-colors"
                onClick={() => toggleDepartment(department)}
              >
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    {department}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {professors.length} professor{professors.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-4">
                  {filteredProfessors.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProfessors.map((professor) => (
                        <div
                          key={professor.id}
                          className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <UserIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">
                              {professor.name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {professor.title}
                            </p>
                            <a
                              href={`mailto:${professor.email}`}
                              className="text-sm text-primary hover:underline truncate block"
                            >
                              {professor.email}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No professors registered in this department yet.
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          );
          })}
        </div>
      )}

      {!isLoading && !error && filteredDepartments.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">
            No departments or professors match your search.
          </p>
        </div>
      )}
    </div>
  );
}
