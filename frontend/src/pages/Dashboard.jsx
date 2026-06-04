import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import SubscriptionCard from "../components/SubscriptionCard";
import SubscriptionForm from "../components/SubscriptionForm";
import {
  CATEGORIES,
  CURRENCY,
  daysUntil,
  monthlyEquivalent,
} from "../lib/sub";

const ALL_FILTER = "all";
const EXPIRING_FILTER = "expiring";
const TRIAL_FILTER = "trials";

export default function Dashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ALL_FILTER);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const fetchSubs = async () => {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("renewal_date", { ascending: true });
    if (error) setErr(error.message);
    setSubs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const stats = useMemo(() => {
    const monthly = subs.reduce((acc, s) => acc + monthlyEquivalent(s), 0);
    const active = subs.length;
    const expiring = subs.filter((s) => {
      const d = daysUntil(s.renewal_date);
      return d !== null && d >= 0 && d <= 4;
    }).length;
    return { monthly, active, expiring };
  }, [subs]);

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (filter === ALL_FILTER) return true;
      if (filter === EXPIRING_FILTER) {
        const d = daysUntil(s.renewal_date);
        return d !== null && d <= 10 && d >= 0;
      }
      if (filter === TRIAL_FILTER) return s.type === "trial";
      return s.category === filter;
    });
  }, [subs, filter]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (sub) => {
    setEditing(sub);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (form) => {
    setSaving(true);
    setErr("");
    try {
      if (editing) {
        const renewalChanged =
          (editing.renewal_date || "").slice(0, 10) !== form.renewal_date;
        const patch = {
          ...form,
          updated_at: new Date().toISOString(),
        };
        if (renewalChanged) patch.reminder_sent = false;
        const { error } = await supabase
          .from("subscriptions")
          .update(patch)
          .eq("id", editing.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert({
          ...form,
          user_id: user.id,
          is_active: true,
          reminder_sent: false,
        });
        if (error) throw error;
      }
      closeModal();
      await fetchSubs();
    } catch (e) {
      setErr(e.message || "Could not save subscription");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Remove ${sub.name}? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", sub.id)
      .eq("user_id", user.id);
    if (error) {
      setErr(error.message);
      return;
    }
    await fetchSubs();
  };

  const filters = [
    { key: ALL_FILTER, label: "All" },
    { key: EXPIRING_FILTER, label: "Expiring soon" },
    { key: TRIAL_FILTER, label: "Trials" },
    ...CATEGORIES.map((c) => ({ key: c, label: c })),
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-14 fade-up">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="heading text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Your subscriptions
          </h1>
          <p className="text-muted mt-3 max-w-md leading-relaxed">
            A calm overview of what's renewing, what's a trial, and what's quietly costing you each month.
          </p>
        </div>
        <button onClick={openNew} className="btn-primary shrink-0" data-testid="add-sub-btn">
          Add subscription
        </button>
      </div>

      {/* Warning banner */}
      {stats.expiring > 0 && (
        <div
          className="surface p-5 mb-8 border-l-[3px] border-l-danger flex items-center justify-between gap-4"
          data-testid="urgent-banner"
          style={{ borderLeftColor: "#C0392B" }}
        >
          <p className="text-sm leading-relaxed">
            <span className="text-danger font-medium">Heads up.</span>{" "}
            <span className="text-ink dark:text-ink-dark">
              {stats.expiring} subscription{stats.expiring > 1 ? "s renew" : " renews"} within the next 4 days.
            </span>
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <SummaryCard
          label="Monthly spend"
          value={CURRENCY(stats.monthly)}
          hint="Total normalised to per month"
          testid="stat-monthly"
        />
        <SummaryCard
          label="Active"
          value={String(stats.active)}
          hint={stats.active === 1 ? "subscription tracked" : "subscriptions tracked"}
          testid="stat-active"
        />
        <SummaryCard
          label="Expiring soon"
          value={String(stats.expiring)}
          hint="within the next 4 days"
          accent={stats.expiring > 0 ? "danger" : "default"}
          testid="stat-expiring"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8" data-testid="filters">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`chip ${filter === f.key ? "chip--active" : ""}`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {err && <p className="text-sm text-danger mb-6" data-testid="dashboard-error">{err}</p>}

      {/* Subscription list */}
      {loading ? (
        <p className="text-muted text-sm" data-testid="dashboard-loading">Loading your subscriptions…</p>
      ) : subs.length === 0 ? (
        <EmptyState onAdd={openNew} />
      ) : filtered.length === 0 ? (
        <div className="surface p-10 text-center" data-testid="empty-filter">
          <p className="text-muted">Nothing matches this filter — try another one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4" data-testid="sub-list">
          {filtered.map((s) => (
            <SubscriptionCard key={s.id} sub={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <SubscriptionForm
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initial={editing}
        busy={saving}
      />
    </div>
  );
}

function SummaryCard({ label, value, hint, accent = "default", testid }) {
  const valueCls = accent === "danger" ? "text-danger" : "text-ink dark:text-ink-dark";
  return (
    <div className="surface p-6" data-testid={testid}>
      <p className="text-xs uppercase tracking-widest text-muted mb-3">{label}</p>
      <p className={`heading text-3xl tracking-tight ${valueCls}`} data-testid={`${testid}-value`}>
        {value}
      </p>
      <p className="text-xs text-muted mt-2">{hint}</p>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="surface p-12 text-center" data-testid="empty-state">
      <p className="heading text-2xl tracking-tight mb-3 max-w-md mx-auto leading-snug">
        No subscriptions yet. Add your first one and never get surprised again.
      </p>
      <p className="text-muted max-w-sm mx-auto leading-relaxed mb-6 text-sm">
        Track what's renewing, what's a trial, and what's quietly costing you.
      </p>
      <button onClick={onAdd} className="btn-primary" data-testid="empty-add-btn">
        Add your first subscription
      </button>
    </div>
  );
}
