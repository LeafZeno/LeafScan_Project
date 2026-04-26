import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.log("Profile fetch error:", error);
    return null;
  }

  return data;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, reason: "not_logged_in", profile: null };
  if (profile.role !== "admin") {
    return { ok: false, reason: "not_admin", profile };
  }
  return { ok: true, reason: null, profile };
}