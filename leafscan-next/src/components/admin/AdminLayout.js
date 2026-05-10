"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/plants", label: "Plants", icon: "🌿" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/", label: "Back to Site", icon: "🏠" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto">
          <h1 className="text-2xl font-extrabold text-green-400 mb-8">
            LeafScan Admin
          </h1>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
                    active
                      ? "bg-green-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="w-full md:ml-64 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
