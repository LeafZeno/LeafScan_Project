"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-4 py-3 rounded-xl transition ${
        active
          ? "bg-green-600 text-white"
          : "bg-slate-800 hover:bg-slate-700 text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="w-full lg:w-72 bg-slate-900 border-r border-slate-800 p-6 shrink-0">
      <Link
        href="/admin"
        className="text-3xl font-bold text-green-400 mb-8 block"
      >
        LeafScan Admin
      </Link>

      <nav className="space-y-3">
        <NavItem href="/admin" label="Dashboard" />
        <NavItem href="/admin/categories" label="Manage Categories" />
        <NavItem href="/admin/plants" label="Manage Plants" />
      </nav>

      <div className="mt-8">
        <Link
          href="/"
          className="block w-full text-center px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700"
        >
          Back to Website
        </Link>
      </div>
    </aside>
  );
}
