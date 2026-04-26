import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.log("User error:", error);
    return null;
  }
  return data.user;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log("Sign out error:", error);
    return false;
  }
  return true;
}