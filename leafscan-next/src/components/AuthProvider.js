"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null);
      return null;
    }

    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.log("Profile load error:", error);
      setProfile(null);
      return null;
    }

    if (existingProfile) {
      setProfile(existingProfile);
      return existingProfile;
    }

    const fullName =
      currentUser.user_metadata?.full_name ||
      currentUser.user_metadata?.name ||
      currentUser.email?.split("@")[0] ||
      "User";

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        email: currentUser.email,
        full_name: fullName,
        role: "user",
      })
      .select()
      .single();

    if (insertError) {
      console.log("Profile create error:", insertError);
      setProfile(null);
      return null;
    }

    setProfile(newProfile);
    return newProfile;
  }

  async function refreshAuth() {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user || null;

    setUser(currentUser);

    if (currentUser) {
      await loadProfile(currentUser);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function initAuth() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;

      if (!active) return;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setProfile(null);
      }

      if (active) setLoading(false);
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;

        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          loadProfile(currentUser);
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      refreshAuth,
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
