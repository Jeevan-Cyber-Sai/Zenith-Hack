"use client";

import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground font-heading">
            STUDEMY
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#leaderboard"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Leaderboard
          </a>
          <a
            href="#cta"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>
        </div>
        <Link href="/login">
          <Button className="rounded-full bg-primary font-bold text-primary-foreground">
            Sign Up Free
          </Button>
        </Link>
      </div>
    </nav>
  );
}
