import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure a profile row exists for the logged-in user
  const ensureProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existing) {
      setProfile(existing);
      return;
    }

    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || "",
        notify_by_email: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      })
      .select()
      .single();

    setProfile(created);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await ensureProfile(data.session.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await ensureProfile(newSession.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
