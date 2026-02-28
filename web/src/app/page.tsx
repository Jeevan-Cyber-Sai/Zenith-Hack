"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("studemy_user", JSON.stringify(data));
      }
      router.push("/app");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          phone: phone || undefined,
          school: school || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("studemy_user", JSON.stringify(data));
      }
      router.push("/app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-violet-950/80 opacity-90 dark:opacity-100" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415522_1px,transparent_1px),linear-gradient(to_bottom,#33415522_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <h1 className="mb-2 text-5xl font-bold tracking-tight drop-shadow-lg sm:text-6xl md:text-7xl text-[var(--foreground)]">
          Studemy
        </h1>
        <p className="mb-12 text-slate-500 dark:text-slate-400">
          Adaptive learning for Class 12 Mathematics
        </p>

        <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex gap-2 rounded-lg bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${activeTab === "login" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${activeTab === "register" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (required for registered accounts)"
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <label className="block text-sm font-medium text-slate-300">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <label className="block text-sm font-medium text-slate-300">
                Password <span className="text-red-400">*</span> (min 6 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <label className="block text-sm font-medium text-slate-300">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <label className="block text-sm font-medium text-slate-300">
                School / Institution (optional)
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="School name"
                className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
