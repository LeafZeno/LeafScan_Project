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

function NavLink({ href, label, icon, onClick }) {
  const pathname = usePathname();
  const active =
    href === "/admin" ? pathname.startsWith("/admin") : pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
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
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#202020] border-b border-slate-800">
        <div className="w-full px-4 md:px-8 py-3 flex items-center gap-4">
          <Link
            href="/"
            onClick={closeMobile}
            className="text-2xl font-extrabold text-green-400 shrink-0"
          >
            LeafScan
          </Link>

          {/* Desktop Nav */}
          <div className="ml-auto hidden xl:flex items-center gap-1 whitespace-nowrap">
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

          {/* Mobile Buttons */}
          <div className="ml-auto flex xl:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
              aria-label="Open search"
            >
              🔎
            </button>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
              aria-label="Open menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-[#202020] px-4 pb-4">
            <nav className="grid grid-cols-1 gap-2 pt-4">
              {isAdmin && (
                <NavLink
                  href="/admin"
                  label="Admin"
                  icon="🛠️"
                  onClick={closeMobile}
                />
              )}

              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  onClick={closeMobile}
                />
              ))}

              <button
                onClick={() => {
                  closeMobile();
                  setSearchOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-md font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                🔎 Search
              </button>

              <div className="pt-2">
                <AuthButtons />
              </div>
            </nav>
          </div>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
