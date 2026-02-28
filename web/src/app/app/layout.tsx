"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type User = { id: string; email: string; name?: string } | null;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("studemy_user") : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!user) {
      router.replace("/");
      return;
    }
  }, [checked, user, router]);

  const handleLogout = () => {
    localStorage.removeItem("studemy_user");
    setUser(null);
    router.replace("/");
  };

  if (!checked || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/app" className="text-xl font-semibold text-white">
            Studemy
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/app/account"
              className="text-sm text-slate-300 hover:text-white underline-offset-2 hover:underline"
              title="Account details"
            >
              Account
            </Link>
            <span className="text-sm text-slate-500">|</span>
            <span className="text-sm text-slate-400">{user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
