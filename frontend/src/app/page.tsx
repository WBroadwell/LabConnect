import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center sm:py-32">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Discover Research Opportunities at RPI
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          LabConnect bridges the gap between students and faculty research.
          Find your next research project, connect with professors, and advance
          your academic career.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/opportunities">Browse Opportunities</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Explore
              </h3>
              <p className="text-muted-foreground">
                Browse research opportunities from professors across all
                departments at RPI.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground">Connect</h3>
              <p className="text-muted-foreground">
                Find projects that match your interests and reach out directly
                to faculty members.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground">Grow</h3>
              <p className="text-muted-foreground">
                Gain hands-on experience, build your resume, and contribute to
                cutting-edge research.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join hundreds of RPI students who have found meaningful research
            experiences through LabConnect.
          </p>
          <Button asChild size="lg">
            <Link href="/opportunities">Find Your Opportunity</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
