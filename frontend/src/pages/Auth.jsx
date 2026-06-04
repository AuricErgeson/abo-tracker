import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          navigate("/dashboard");
        } else {
          setInfo("Check your inbox to confirm your email, then sign in.");
          setMode("login");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onMagicLink = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Enter your email to receive a magic link.");
      return;
    }
    setMagicBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      setInfo("Magic link sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Could not send magic link");
    } finally {
      setMagicBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-8">
        <span className="heading text-xl tracking-tight" data-testid="auth-brand">
          Abo<span className="text-accent">.</span>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md fade-up">
          <h1 className="heading text-4xl sm:text-5xl leading-tight mb-3">
            {mode === "login" ? "Welcome back." : "Start tracking your subscriptions."}
          </h1>
          <p className="text-muted mb-10 leading-relaxed">
            {mode === "login"
              ? "Sign in to see what's renewing soon."
              : "No more surprise charges. Add your first subscription in under a minute."}
          </p>

          <div className="flex gap-2 mb-8" role="tablist">
            <button
              type="button"
              data-testid="auth-tab-login"
              onClick={() => setMode("login")}
              className={`chip ${mode === "login" ? "chip--active" : ""}`}
            >
              Sign in
            </button>
            <button
              type="button"
              data-testid="auth-tab-register"
              onClick={() => setMode("register")}
              className={`chip ${mode === "register" ? "chip--active" : ""}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" data-testid="auth-form">
            {mode === "register" && (
              <div>
                <label className="label" htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  data-testid="auth-input-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="field"
                  placeholder="Anna Schmidt"
                />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                data-testid="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                data-testid="auth-input-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                placeholder="at least 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p data-testid="auth-error" className="text-sm text-danger">{error}</p>
            )}
            {info && (
              <p data-testid="auth-info" className="text-sm text-accent">{info}</p>
            )}

            <button
              type="submit"
              data-testid="auth-submit-btn"
              disabled={busy}
              className="btn-primary w-full"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-bg px-3 text-muted">or</span>
            </div>
          </div>

          <button
            type="button"
            data-testid="auth-magic-link-btn"
            onClick={onMagicLink}
            disabled={magicBusy}
            className="btn-secondary w-full"
          >
            {magicBusy ? "Sending…" : "Email me a magic link"}
          </button>

          <p className="text-xs text-muted mt-10 leading-relaxed">
            By continuing you agree to keep your subscriptions in check. We won't email you anything you didn't ask for.
          </p>
        </div>
      </div>
    </div>
  );
}
