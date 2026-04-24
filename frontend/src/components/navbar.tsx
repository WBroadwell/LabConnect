"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const navLinks = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/opportunities", label: "Opportunities", requiresAuth: true },
  { href: "/departments", label: "Departments", requiresAuth: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, login, logout, setTestUserId, isLoading } = useAuth();
  const isTestingMode = process.env.NEXT_PUBLIC_APP_ENV !== "production";
  const handleSignIn = isTestingMode ? () => setTestUserId(1) : login;

  return (
    <nav className="border-b border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Image
            src="/simple_logo-transparent.png"
            alt="LabConnect Logo"
            width={36}
            height={36}
            className="brightness-0 invert"
          />
          LabConnect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-foreground/20"
                      : "hover:bg-primary-foreground/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Auth */}
          {!isLoading && (
            isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                    <p className="text-muted-foreground text-xs capitalize">
                      Role: {user?.role}{user?.is_admin && " (Admin)"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleSignIn}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks
                .filter((link) => !link.requiresAuth || isAuthenticated)
                .map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "w-full",
                        pathname === link.href && "bg-accent"
                      )}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              {!isLoading && isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : !isLoading ? (
                <DropdownMenuItem onClick={handleSignIn}>
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
