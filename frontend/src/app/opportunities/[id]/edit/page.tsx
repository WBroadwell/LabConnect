"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const CREDIT_OPTIONS = ["1", "2", "3", "4"];
const TYPE_OPTIONS = ["Research", "Internship", "Part-time", "Full-time", "Volunteer"];

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;
  const { isAuthenticated, isLoading: authLoading, testUserId, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    application_due: "",
    type: "",
    hourlyPay: 0,
    credits: [] as string[],
    description: "",
    recommended_experience: "",
    location: "",
    years: [] as string[],
    start_date: "",
    end_date: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/opportunities");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch existing opportunity data
  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const response = await fetch(
          `/api/opportunities/${opportunityId}`
        );
        if (!response.ok) {
          throw new Error("Opportunity not found");
        }
        const data = await response.json();

        // Check if user can edit (is creator or admin)
        if (data.created_by_id !== user?.id && !user?.is_admin) {
          router.push("/profile");
          return;
        }

        setFormData({
          name: data.name || "",
          title: data.title || "",
          application_due: data.application_due || "",
          type: data.type || "",
          hourlyPay: data.hourlyPay || 0,
          credits: data.credits || [],
          description: data.description || "",
          recommended_experience: data.recommended_experience || "",
          location: data.location || "",
          years: data.years || [],
          start_date: data.start_date || "",
          end_date: data.end_date || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (opportunityId && user) {
      fetchOpportunity();
    }
  }, [opportunityId, user, router]);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    clearFieldError(name);
    if (name === "start_date" || name === "end_date") clearFieldError("dates");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyPay" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    clearFieldError(name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (
    field: "years" | "credits",
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((v) => v !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const today = new Date().toISOString().split("T")[0];
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Professor/Lab Name is required.";
    if (!formData.title.trim()) errors.title = "Opportunity Title is required.";
    if (!formData.location.trim()) errors.location = "Location is required.";
    if (formData.application_due && formData.application_due < today)
      errors.application_due = "Application deadline cannot be in the past.";
    if (formData.end_date && formData.end_date < today)
      errors.dates = "End date cannot be in the past.";
    else if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date)
      errors.dates = "End date must be after start date.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      const fieldOrder = ["name", "title", "application_due", "dates", "location"];
      for (const field of fieldOrder) {
        if (errors[field] && fieldRefs.current[field]) {
          fieldRefs.current[field]!.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (testUserId) {
        headers["X-User-Id"] = testUserId.toString();
      }

      const response = await fetch(
        `/api/opportunities/${opportunityId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update opportunity");
      }

      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const errCls = "border-destructive focus-visible:ring-destructive";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-lg font-semibold text-center">
          <CardTitle>Edit Opportunity</CardTitle>
          <CardDescription>
            Update the details of your research opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div
              className="space-y-2"
              ref={(el) => { fieldRefs.current["name"] = el; }}
            >
              <Label htmlFor="name">Professor/Lab Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Smith's Lab"
                className={fieldErrors.name ? errCls : ""}
              />
              {fieldErrors.name && (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div
              className="space-y-2"
              ref={(el) => { fieldRefs.current["title"] = el; }}
            >
              <Label htmlFor="title">Opportunity Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Machine Learning Research Assistant"
                className={fieldErrors.title ? errCls : ""}
              />
              {fieldErrors.title && (
                <p className="text-sm text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="space-y-2"
                ref={(el) => { fieldRefs.current["application_due"] = el; }}
              >
                <Label htmlFor="application_due">Application Deadline (Optional)</Label>
                <Input
                  id="application_due"
                  name="application_due"
                  type="date"
                  value={formData.application_due}
                  onChange={handleInputChange}
                  className={fieldErrors.application_due ? errCls : ""}
                />
                {fieldErrors.application_due && (
                  <p className="text-sm text-destructive">{fieldErrors.application_due}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Opportunity Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className="grid gap-4 sm:grid-cols-2"
              ref={(el) => { fieldRefs.current["dates"] = el; }}
            >
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date (Optional)</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={fieldErrors.dates ? errCls : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={fieldErrors.dates ? errCls : ""}
                />
              </div>

              {fieldErrors.dates && (
                <p className="sm:col-span-2 text-sm text-destructive">{fieldErrors.dates}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourlyPay">Hourly Pay ($)</Label>
                <Input
                  id="hourlyPay"
                  name="hourlyPay"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyPay}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <div
                className="space-y-2"
                ref={(el) => { fieldRefs.current["location"] = el; }}
              >
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Lally Hall 101"
                  className={fieldErrors.location ? errCls : ""}
                />
                {fieldErrors.location && (
                  <p className="text-sm text-destructive">{fieldErrors.location}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Credits Available</Label>
              <div className="flex flex-wrap gap-4">
                {CREDIT_OPTIONS.map((credit) => (
                  <div key={credit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`credit-${credit}`}
                      checked={formData.credits.includes(credit)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("credits", credit, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`credit-${credit}`}
                      className="font-normal"
                    >
                      {credit} credit{parseInt(credit) > 1 ? "s" : ""}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Eligible Years</Label>
              <div className="flex flex-wrap gap-4">
                {YEAR_OPTIONS.map((year) => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={`year-${year}`}
                      checked={formData.years.includes(year)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("years", year, checked as boolean)
                      }
                    />
                    <Label htmlFor={`year-${year}`} className="font-normal">
                      {year}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the research opportunity, responsibilities, and goals..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommended_experience">
                Recommended Experience (Optional)
              </Label>
              <Textarea
                id="recommended_experience"
                name="recommended_experience"
                value={formData.recommended_experience}
                onChange={handleInputChange}
                placeholder="e.g., Python programming, machine learning coursework..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
