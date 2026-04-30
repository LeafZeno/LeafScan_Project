"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(user) {
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.log("Profile load error:", error);
      setProfile(null);
      return;
    }

    if (existingProfile) {
      setProfile(existingProfile);
      return;
    }

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: "user",
      })
      .select()
      .single();

    if (insertError) {
      console.log("Profile create error:", insertError);
      setProfile(null);
      return;
    }

    setProfile(newProfile);
  }

  async function refreshAuth() {
    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const currentUser = data?.user || null;

    setUser(currentUser);

    if (currentUser) {
      await loadProfile(currentUser);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function getSession() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setUser(data.session.user);
        await loadProfile(data.session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    }

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      },
    );

    return () => {
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
