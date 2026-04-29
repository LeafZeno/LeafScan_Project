"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOutUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/AppShell";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadProfile() {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setAuthUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
      }

      setProfile(data || null);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    const ok = await signOutUser();
    if (ok) router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <AppShell>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm">Full Name</p>
            <p className="text-lg">{profile?.full_name || "-"}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Email</p>
            <p className="text-lg">
              {profile?.email || authUser?.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Role</p>
            <p className="text-lg">{profile?.role || "user"}</p>
          </div>

          <div className="pt-4">
            <Link
              href="/favorites"
              className="inline-block px-4 py-2 bg-yellow-500 text-slate-950 rounded hover:bg-yellow-600 font-medium"
            >
              ⭐ View My Favorites
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
