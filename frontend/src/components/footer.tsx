import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-primary-foreground/80">
            <span className="font-semibold text-primary-foreground">
              LabConnect
            </span>{" "}
            is an open source project developed by{" "}
            <Link
              href="https://new.rcos.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/70"
            >
              RCOS
            </Link>{" "}
            at{" "}
            <Link
              href="https://rpi.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/70"
            >
              Rensselaer Polytechnic Institute
            </Link>
            .
          </p>
          <p className="text-xs text-primary-foreground/70">
            Connecting students with research opportunities across campus.
          </p>
          <div className="flex gap-4 text-sm text-primary-foreground/70">
            <Link
              href="https://github.com/LabConnect-RCOS/LabConnect"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground"
            >
              GitHub
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-primary-foreground">
              About
            </Link>
          </div>
          <p className="text-xs text-primary-foreground/70">
            &copy; {new Date().getFullYear()} Rafael Cenzano & LabConnect Team.
            Open source under{" "}
            <Link
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-primary-foreground"
            >
              AGPL-3.0 License
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
