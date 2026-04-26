"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";
import { useAuth } from "@/components/AuthProvider";
import SearchOverlay from "@/components/SearchOverlay";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/plants", label: "Explore", icon: "🌿" },
  { href: "/scan", label: "Scan", icon: "📷" },
  { href: "/favorites", label: "Favorites", icon: "⭐" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

function NavLink({ href, label, icon }) {
  const pathname = usePathname();
  const active =
    href === "/admin" ? pathname.startsWith("/admin") : pathname === href;

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-300 ${
        active
          ? "bg-slate-700 text-white"
          : "text-slate-200 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>

      {active && (
        <span className="absolute left-3 right-3 -bottom-1 h-[3px] rounded-full bg-green-400" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const { isAdmin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#202020] border-b border-slate-800">
        <div className="w-full px-8 py-3 flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-extrabold text-green-400 shrink-0"
          >
            LeafScan
          </Link>

          <div className="ml-auto hidden lg:flex items-center gap-2">
            {isAdmin && <NavLink href="/admin" label="Admin" icon="🛠️" />}

            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              🔎 Search
            </button>

            <AuthButtons />
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
