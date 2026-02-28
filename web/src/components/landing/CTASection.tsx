"use client";

import { Rocket, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="cta" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl md:px-16">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-bold backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> BONUS: Earn 500 XP on signup!
            </div>
            <Rocket className="mx-auto mb-4 h-12 w-12 animate-bounce" />
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Ready to Level Up?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-lg opacity-90">
              Join thousands of students who are already turning study sessions
              into epic adventures.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="group rounded-full bg-card px-10 text-lg font-bold text-foreground shadow-lg transition-all hover:scale-105"
                >
                  <Zap className="mr-1 h-5 w-5 transition-transform group-hover:rotate-12" />
                  Get Started — It&apos;s Free 🎮
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                <Star className="h-3 w-3" /> 500 XP Bonus
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                🏆 Starter Badge
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                🔥 3-Day Streak Shield
              </span>
            </div>
          </div>
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary-foreground/10 animate-pulse" />
          <div
            className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-primary-foreground/10 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary-foreground/5" />
        </div>
      </div>
    </section>
  );
}
