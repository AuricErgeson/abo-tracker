import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

// A small curated set of common timezones; users can also type a custom one.
const TIMEZONES = [
  "UTC",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [notify, setNotify] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setNotify(profile.notify_by_email ?? true);
      setTimezone(profile.timezone || "UTC");
    }
  }, [profile]);

  const onSave = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        notify_by_email: notify,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) setErr(error.message);
    else {
      setInfo("Saved.");
      await refreshProfile();
    }
    setSaving(false);
  };

  const onLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const onDelete = async () => {
    const confirm1 = window.prompt(
      'This will permanently remove all your subscriptions and your profile. Type DELETE to confirm.'
    );
    if (confirm1 !== "DELETE") return;
    setDeleting(true);
    setErr("");
    try {
      await supabase.from("reminder_logs").delete().eq("user_id", user.id);
      await supabase.from("subscriptions").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (e) {
      setErr(e.message || "Could not delete your data.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14 fade-up">
      <h1 className="heading text-4xl sm:text-5xl tracking-tight mb-3">Your profile.</h1>
      <p className="text-muted mb-10 leading-relaxed">
        Small details that make the app feel like yours.
      </p>

      <form onSubmit={onSave} className="space-y-6 surface p-6 sm:p-8" data-testid="profile-form">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="field opacity-70 cursor-not-allowed"
            data-testid="profile-email"
          />
        </div>

        <div>
          <label className="label" htmlFor="full_name">Full name</label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="field"
            data-testid="profile-fullname"
          />
        </div>

        <div>
          <label className="label" htmlFor="timezone">Timezone</label>
          <input
            id="timezone"
            type="text"
            list="tz-list"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="field"
            data-testid="profile-timezone"
          />
          <datalist id="tz-list">
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
        </div>

        <div className="flex items-start justify-between gap-4 pt-2">
          <div>
            <p className="text-sm font-medium">Email reminders</p>
            <p className="text-xs text-muted mt-1 max-w-xs leading-relaxed">
              We'll quietly remind you a few days before a renewal lands.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notify}
            onClick={() => setNotify((v) => !v)}
            data-testid="profile-notify-toggle"
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
              notify ? "bg-accent" : "bg-line dark:bg-line-dark"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform bg-white rounded-full transition-transform duration-150 mt-0.5 ${
                notify ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {err && <p className="text-sm text-danger" data-testid="profile-error">{err}</p>}
        {info && <p className="text-sm text-accent" data-testid="profile-info">{info}</p>}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary" data-testid="profile-save-btn">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <div className="surface p-6 sm:p-8 mt-8">
        <h2 className="heading text-xl tracking-tight mb-1">Session</h2>
        <p className="text-sm text-muted mb-5">Sign out of this device.</p>
        <button onClick={onLogout} className="btn-secondary" data-testid="profile-logout-btn">
          Log out
        </button>
      </div>

      <div className="surface p-6 sm:p-8 mt-8 border-danger/20">
        <h2 className="heading text-xl tracking-tight mb-1">Delete account</h2>
        <p className="text-sm text-muted mb-5 leading-relaxed">
          Removes your profile and every subscription you've added. This cannot be undone.
        </p>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="btn-danger"
          data-testid="profile-delete-btn"
        >
          {deleting ? "Deleting…" : "Delete my account data"}
        </button>
      </div>
    </div>
  );
}
