import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">LabConnect</span> is
            an open source project developed by{" "}
            <Link
              href="https://rcos.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              RCOS
            </Link>{" "}
            at{" "}
            <Link
              href="https://rpi.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Rensselaer Polytechnic Institute
            </Link>
            .
          </p>
          <p className="text-xs text-muted-foreground">
            Connecting students with research opportunities across campus.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link
              href="https://github.com/rcos/labconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LabConnect. Open source under MIT
            License.
          </p>
        </div>
      </div>
    </footer>
  );
}
