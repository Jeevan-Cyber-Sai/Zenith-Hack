"use client";

import {
  Crown,
  Flame,
  Star,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const players = [
  {
    name: "Alex M.",
    xp: 12450,
    streak: 14,
    level: 28,
    avatar: "🧑‍🎓",
    title: "Legend",
  },
  {
    name: "Sarah K.",
    xp: 11200,
    streak: 21,
    level: 26,
    avatar: "👩‍💻",
    title: "Champion",
  },
  {
    name: "Jake T.",
    xp: 10800,
    streak: 9,
    level: 25,
    avatar: "🧑‍🔬",
    title: "Warrior",
  },
  {
    name: "Mia R.",
    xp: 9500,
    streak: 7,
    level: 22,
    avatar: "👩‍🎨",
    title: "Explorer",
  },
  {
    name: "You",
    xp: 8700,
    streak: 5,
    level: 20,
    avatar: "🎯",
    title: "Rising Star",
  },
];

const rankColors = [
  "from-xp/20 to-xp/5",
  "from-muted/50 to-muted/20",
  "from-streak/15 to-streak/5",
];

export default function LeaderboardPreview() {
  const [claimedXp, setClaimedXp] = useState(false);

  return (
    <section id="leaderboard" className="px-4 py-20">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-4xl font-bold text-foreground md:text-5xl">
            <Crown className="mr-2 inline h-10 w-10 text-xp" />
            Leaderboard
          </h2>
          <p className="text-lg text-muted-foreground">
            See where you stand among your peers!
          </p>
        </div>

        <div className="game-card space-y-3 !p-4">
          {players.map((player, i) => (
            <div
              key={player.name}
              className={`flex items-center gap-4 rounded-xl p-3 transition-all duration-300 ${
                player.name === "You"
                  ? "bg-primary/10 ring-2 ring-primary scale-[1.02]"
                  : i < 3
                    ? `bg-gradient-to-r ${rankColors[i]}`
                    : "hover:bg-muted"
              }`}
            >
              <span className="w-7 text-center text-lg font-bold text-muted-foreground">
                {i === 0
                  ? "👑"
                  : i === 1
                    ? "🥈"
                    : i === 2
                      ? "🥉"
                      : `#${i + 1}`}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {player.name}
                  </span>
                  <span className="level-badge text-xs">
                    Lv.{player.level}
                  </span>
                  {i === 0 && <Award className="h-4 w-4 text-xp" />}
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(player.xp / 13000) * 100}
                    className="mt-1 h-2 flex-1"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {player.title}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="streak-badge text-xs">
                  <Flame className="h-3 w-3" /> {player.streak}
                </span>
                <span className="xp-badge text-xs">
                  <Star className="h-3 w-3" /> {player.xp.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setClaimedXp(true)}
            disabled={claimedXp}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all ${
              claimedXp
                ? "bg-muted text-muted-foreground cursor-default"
                : "bg-primary text-primary-foreground shadow-lg hover:scale-105 animate-pulse"
            }`}
            style={
              !claimedXp
                ? { boxShadow: "0 0 20px hsl(142 60% 45% / 0.4)" }
                : {}
            }
          >
            {claimedXp ? (
              <>✅ +50 XP Claimed!</>
            ) : (
              <>
                <Zap className="h-5 w-5" /> Claim Daily Bonus XP
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Complete more quests to climb the ranks!
          </p>
        </div>
      </div>
    </section>
  );
}
