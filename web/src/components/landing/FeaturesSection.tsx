"use client";

import {
  Brain,
  Flame,
  Trophy,
  Target,
  Gamepad2,
  BarChart3,
  Lock,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description:
      "AI adjusts difficulty in real-time based on your performance.",
    color: "text-accent",
    bg: "bg-accent/10",
    xp: "+100 XP",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Keep your streak alive and earn bonus XP every day!",
    color: "text-streak",
    bg: "bg-streak/10",
    xp: "+50 XP",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Compete with classmates and climb to the top.",
    color: "text-xp",
    bg: "bg-xp/10",
    xp: "+200 XP",
  },
  {
    icon: Target,
    title: "Quests & Missions",
    description: "Complete learning quests to unlock badges and rewards.",
    color: "text-primary",
    bg: "bg-primary/10",
    xp: "+150 XP",
  },
  {
    icon: Gamepad2,
    title: "Interactive Quizzes",
    description: "Fun mini-games that test your knowledge.",
    color: "text-level",
    bg: "bg-level/10",
    xp: "+75 XP",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual dashboards to monitor your learning journey.",
    color: "text-success",
    bg: "bg-success/10",
    xp: "+80 XP",
  },
];

export default function FeaturesSection() {
  const [unlockedCards, setUnlockedCards] = useState<Set<number>>(new Set());

  const handleUnlock = (index: number) => {
    setUnlockedCards((prev) => new Set(prev).add(index));
  };

  return (
    <section id="features" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-bold text-foreground md:text-5xl">
            Why Students <span className="gradient-text">Love It</span> ❤️
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Every feature is designed to keep you engaged and learning
            effectively.
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            🎮 Click each card to unlock!
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const isUnlocked = unlockedCards.has(i);
            return (
              <div
                key={feature.title}
                className={`game-card cursor-pointer opacity-0 animate-slide-up select-none transition-all duration-500 ${
                  isUnlocked ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => handleUnlock(i)}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}
                  >
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  {isUnlocked ? (
                    <span className="xp-badge animate-bounce-in text-xs">
                      {feature.xp}
                    </span>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
                {isUnlocked && (
                  <div className="mt-3 text-xs font-bold text-primary animate-slide-up">
                    ✅ Feature Unlocked!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
