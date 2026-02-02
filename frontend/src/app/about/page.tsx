import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Building2,
  Github,
  ExternalLink,
  Code2,
  Heart,
  Search,
  Bookmark,
  UserCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About LabConnect
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connecting RPI students with research opportunities across campus,
          making it easier than ever to find and apply for positions that match
          your interests and skills.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            LabConnect was created to bridge the gap between students seeking
            research experience and professors looking for talented individuals
            to join their labs. We believe that research opportunities should be
            accessible and discoverable for all students, regardless of their
            connections or prior experience.
          </p>
          <p>
            Our platform provides a centralized hub where professors can post
            research opportunities and students can browse, filter, and apply
            for positions that align with their academic and career goals.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">For Students</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Browse research opportunities across all departments, save positions
            you&apos;re interested in, and connect directly with professors.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">For Professors</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Post research opportunities, manage applications, and find talented
            students to join your research team.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">For RPI</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Strengthen the research community by making it easier for students
            and faculty to collaborate on groundbreaking projects.
          </CardContent>
        </Card>
      </div>

      {/* Student Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Getting Started as a Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Follow these steps to find research opportunities that match your interests:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Browse Opportunities
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visit the{" "}
                    <Link href="/opportunities" className="text-primary hover:underline">
                      Opportunities
                    </Link>{" "}
                    page to explore available research positions. Use filters to narrow
                    down by type, pay, credits, or year.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Explore Departments
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check out the{" "}
                    <Link href="/departments" className="text-primary hover:underline">
                      Departments
                    </Link>{" "}
                    page to find professors in your field of interest and view their
                    research focus areas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-primary" />
                    Save Opportunities
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in and click the bookmark icon on any opportunity to save it
                    for later. View all saved opportunities from your{" "}
                    <Link href="/profile" className="text-primary hover:underline">
                      Profile
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    Apply
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact professors directly via email to express your interest.
                    Be sure to mention relevant coursework and why their research
                    interests you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professor Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Getting Started as a Professor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Follow these steps to set up your profile and post research opportunities:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-primary" />
                    Update Your Profile
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in and visit your{" "}
                    <Link href="/profile" className="text-primary hover:underline">
                      Profile
                    </Link>{" "}
                    page. Add your department, office location, and research interests
                    so students can find you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Create Opportunities
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click{" "}
                    <Link href="/opportunities/create" className="text-primary hover:underline">
                      Create New
                    </Link>{" "}
                    from your profile to post research positions. Include details about
                    pay, credits, required experience, and application deadlines.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Manage Listings
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and edit all your posted opportunities from your profile page.
                    Update or remove listings as positions are filled.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Connect with Students
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Students will reach out via email when interested in your
                    opportunities. Your profile will be visible on the department page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RCOS Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Built by RCOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            LabConnect is an open source project developed through the{" "}
            <Link
              href="https://new.rcos.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Rensselaer Center for Open Source (RCOS)
            </Link>
            , a community of students at RPI who work on open source projects
            for academic credit.
          </p>
          <p>
            RCOS provides a supportive environment for students to learn about
            open source development, collaborate with peers, and contribute to
            projects that benefit the broader community.
          </p>
        </CardContent>
      </Card>

      {/* License Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Open Source License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            LabConnect is free software released under the{" "}
            <Link
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GNU Affero General Public License v3.0 (AGPL-3.0)
            </Link>
            .
          </p>
          <p>
            This means you are free to use, modify, and distribute the software,
            provided that any modified versions are also released under the same
            license and the source code is made available to users who interact
            with the software over a network.
          </p>
          <p className="text-sm">
            Copyright &copy; 2025 Rafael Cenzano & LabConnect Team
          </p>
        </CardContent>
      </Card>

      {/* Contributing Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Contribute
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We welcome contributions from the community! Whether you&apos;re
            fixing bugs, adding features, or improving documentation, your help
            is appreciated.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link
                href="https://github.com/LabConnect-RCOS/LabConnect"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href="https://github.com/LabConnect-RCOS/LabConnect/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Report an Issue
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore research opportunities or post your own.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/opportunities">Browse Opportunities</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/departments">Explore Departments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
