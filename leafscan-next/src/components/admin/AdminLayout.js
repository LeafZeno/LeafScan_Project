"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children, title, description }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8">
          {(title || description) && (
            <div className="mb-8">
              {title && <h1 className="text-4xl font-bold">{title}</h1>}
              {description && (
                <p className="text-slate-400 mt-2">{description}</p>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
