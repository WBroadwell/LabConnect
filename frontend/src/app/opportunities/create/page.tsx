"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
const CREDIT_OPTIONS = ["1", "2", "3", "4"];
const TYPE_OPTIONS = ["Research", "Internship", "Part-time", "Full-time", "Volunteer"];

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { canCreateOpportunities, isLoading, testUserId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  });

  // Redirect unauthorized users
  useEffect(() => {
    if (!isLoading && !canCreateOpportunities) {
      router.push("/opportunities");
    }
  }, [isLoading, canCreateOpportunities, router]);

  // Show loading state while checking auth
  if (isLoading || !canCreateOpportunities) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyPay" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (testUserId) {
        headers["X-User-Id"] = testUserId.toString();
      }

      const response = await fetch("http://localhost:5000/api/opportunities", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create opportunity");
      }

      router.push("/opportunities");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Opportunity</CardTitle>
          <CardDescription>
            Fill out the form below to create a new research opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Professor/Lab Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Dr. Smith's Lab"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Opportunity Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Machine Learning Research Assistant"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="application_due">Application Deadline</Label>
                <Input
                  id="application_due"
                  name="application_due"
                  type="date"
                  value={formData.application_due}
                  onChange={handleInputChange}
                  required
                />
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

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Lally Hall 101"
                  required
                />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the research opportunity, responsibilities, and goals..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommended_experience">
                Recommended Experience
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

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Opportunity"}
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
