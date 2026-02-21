"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RPI_DEPARTMENTS } from "@/types";
import { Loader2, Info } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "student" as "student" | "professor",
    department: "",
    title: "",
    professorCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          departments: formData.department ? [formData.department] : [],
          title: formData.role === "professor" ? formData.title : undefined,
          professor_code: formData.role === "professor" ? formData.professorCode : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      // Refresh user data and redirect
      await refreshUser();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started with LabConnect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">I am a...</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "student" | "professor") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professor">Professor / Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your department" />
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

            {formData.role === "professor" && (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Associate Professor"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="professorCode">Professor Confirmation Code</Label>
                  <Input
                    id="professorCode"
                    value={formData.professorCode}
                    onChange={(e) => setFormData({ ...formData, professorCode: e.target.value.toUpperCase() })}
                    placeholder="Enter your 8-character code"
                    required
                    maxLength={8}
                    className="mt-1 font-mono uppercase"
                  />
                  <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      Professor registration requires a confirmation code from a LabConnect administrator.
                      Contact your department or the RCOS team if you need a code.
                    </p>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
