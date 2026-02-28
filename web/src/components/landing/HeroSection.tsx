"use client";

import { Zap, Trophy, Star, Sparkles, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <Star
          className="absolute top-20 left-[10%] h-6 w-6 text-xp animate-float"
          style={{ animationDelay: "0s" }}
        />
        <Star
          className="absolute top-32 right-[15%] h-8 w-8 text-xp animate-float"
          style={{ animationDelay: "1s" }}
        />
        <Zap
          className="absolute bottom-32 left-[20%] h-5 w-5 text-streak animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <Trophy
          className="absolute top-40 right-[25%] h-6 w-6 text-accent animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <Sparkles
          className="absolute top-52 left-[5%] h-5 w-5 text-primary animate-float"
          style={{ animationDelay: "2s" }}
        />
        <Shield
          className="absolute bottom-20 right-[10%] h-6 w-6 text-level animate-float"
          style={{ animationDelay: "0.8s" }}
        />
        <Swords
          className="absolute top-28 left-[40%] h-5 w-5 text-streak animate-float"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      <div className="container mx-auto flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            <span className="gradient-text">STUDEMY</span>
          </h1>
          <p className="mb-2 text-xl font-semibold text-foreground md:text-2xl">
            Learn. Play. Level Up. 🚀
          </p>
          <p className="mb-8 max-w-lg text-lg text-muted-foreground">
            An interactive adaptive learning platform that makes studying feel
            like a game. Earn XP, unlock achievements, and climb the
            leaderboard!
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button
                size="lg"
                className="group rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:scale-105"
                style={{
                  boxShadow: "0 4px 20px hsl(142 60% 45% / 0.4)",
                }}
              >
                <Swords className="mr-1 h-5 w-5 transition-transform group-hover:rotate-12" />
                Start Your Quest
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 px-8 text-lg font-bold transition-all hover:scale-105"
            >
              🎬 Watch Demo
            </Button>
          </div>

          <div
            className="mt-6 flex flex-wrap gap-2 animate-slide-up opacity-0"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="xp-badge text-xs">
              <Trophy className="h-3 w-3" /> Top Learner
            </span>
            <span className="streak-badge text-xs">
              <Zap className="h-3 w-3" /> 7-Day Streak
            </span>
            <span className="level-badge text-xs">
              <Shield className="h-3 w-3" /> Quiz Master
            </span>
          </div>

          <div className="mt-6 flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={50} suffix="+" />
              </p>
              <p className="text-sm text-muted-foreground">Quests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={1200} />
              </p>
              <p className="text-sm text-muted-foreground">Players</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={98} suffix="%" />
              </p>
              <p className="text-sm text-muted-foreground">Fun Rate</p>
            </div>
          </div>
        </div>

        <div className="flex-1 animate-float">
          <div className="relative w-full max-w-xl">
            <Image
              src="/hero-illustration.png"
              alt="Students learning together with gamified elements"
              width={600}
              height={600}
              className="w-full rounded-3xl shadow-2xl"
              priority
            />

            {/* Floating preview of the in-app experience */}
            <div className="pointer-events-auto absolute -bottom-6 left-4 right-4 mx-auto max-w-md rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-xl backdrop-blur-md animate-slide-up">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-100">
                  <Swords className="h-3 w-3 text-streak" />
                  Live Quest · Class 12 Maths
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  +10 XP per correct step
                </span>
              </div>
              <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  AI Tutor Chat
                </p>
                <p className="mt-1 text-sm text-slate-100">
                  You're solving a question from{" "}
                  <span className="font-semibold text-primary">
                    Continuity & Differentiability
                  </span>
                  . Explain your steps and I&apos;ll nudge you whenever you slip.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="inline-flex max-w-[80%] items-start gap-2 rounded-2xl bg-slate-800/80 px-3 py-2 text-slate-100">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <p>
                    Tip: focus on the definition of continuity at x = a, then
                    check left and right limits step by step.
                  </p>
                </div>
                <div className="ml-auto inline-flex max-w-[80%] items-start gap-2 rounded-2xl bg-primary/20 px-3 py-2 text-primary-foreground">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p>
                    Got it! I&apos;ll write my solution like a proper board
                    exam answer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
