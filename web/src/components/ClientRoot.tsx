"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import NovaChatbot from "./NovaChatbot";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <NovaChatbot />
    </ThemeProvider>
  );
}
