"use client";

import Navbar from "@/components/Navbar";

export default function AppShell({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
