"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import Toast from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [stats, setStats] = useState({
    plants: 0,
    categories: 0,
    favorites: 0,
    users: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      const access = await requireAdmin();

      if (!access.ok) {
        if (access.reason === "not_logged_in") {
          router.push("/login");
          return;
        }

        if (access.reason === "not_admin") {
          setAccessError("You do not have admin access.");
          setLoading(false);
          return;
        }
      }

      const [
        { count: plantsCount, error: plantsError },
        { count: categoriesCount, error: categoriesError },
        { count: favoritesCount, error: favoritesError },
        { count: usersCount, error: usersError },
      ] = await Promise.all([
        supabase.from("plants").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("favorites").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      if (plantsError) console.log(plantsError);
      if (categoriesError) console.log(categoriesError);
      if (favoritesError) console.log(favoritesError);
      if (usersError) console.log(usersError);

      setStats({
        plants: plantsCount || 0,
        categories: categoriesCount || 0,
        favorites: favoritesCount || 0,
        users: usersCount || 0,
      });

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard" description="Loading dashboard...">
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Overview of your LeafScan system."
    >
      <Toast
        message={accessError}
        type="error"
        onClose={() => setAccessError("")}
      />

      {!accessError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Total Plants</p>
              <h2 className="text-3xl font-bold mt-2">{stats.plants}</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Categories</p>
              <h2 className="text-3xl font-bold mt-2">{stats.categories}</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Favorites</p>
              <h2 className="text-3xl font-bold mt-2">{stats.favorites}</h2>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Users</p>
              <h2 className="text-3xl font-bold mt-2">{stats.users}</h2>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-2">Admin Notes</h3>
            <p className="text-slate-400">
              Use the sidebar to manage categories and plants. Image upload is
              handled directly through Supabase Storage.
            </p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
