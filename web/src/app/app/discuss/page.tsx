"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

export default function DiscussPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("studemy_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadMessages = () => {
    setLoading(true);
    setError("");
    fetch("/api/discuss")
      .then(async (res) => {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          throw new Error("Unexpected response while loading discussion.");
        }
        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to load discussion.");
        }
        setMessages(data as Message[]);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load discussion."
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content,
        }),
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error("Unexpected response while posting message.");
      }
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to post message.");
      }
      setContent("");
      setMessages((prev) => [...prev, data as Message]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to post message."
      );
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app" className="text-slate-400 hover:text-white">
          ← Back to dashboard
        </Link>
        <h1 className="text-xl font-bold text-white">Discuss while you learn</h1>
      </div>

      <p className="text-sm text-slate-300">
        Use this shared discussion space to ask doubts, share solution ideas, and
        help other students while you solve questions.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Live discussion</h2>
            <button
              type="button"
              onClick={loadMessages}
              className="text-xs text-slate-400 hover:text-white"
            >
              Refresh
            </button>
          </div>
          <div className="h-72 space-y-3 overflow-y-auto rounded-lg bg-slate-950/60 p-3 text-sm">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-slate-400">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="rounded-md bg-slate-800/70 p-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{m.user.name || m.user.email}</span>
                    <span>
                      {mounted
                        ? new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "\u00a0"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-100 whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-100">
            Share your thoughts
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Ask a doubt, share a hint, or discuss a tricky step…"
              className="w-full rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {sending ? "Posting…" : "Post message"}
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Please keep the discussion respectful and focused on learning.
          </p>
        </div>
      </div>
    </div>
  );
}

