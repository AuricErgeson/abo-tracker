import React, { useEffect, useState } from "react";
import { CATEGORIES, CYCLES, TYPES } from "../lib/sub";

const empty = {
  name: "",
  category: "streaming",
  price: "",
  cycle: "monthly",
  type: "paid",
  renewal_date: "",
  notes: "",
};

export default function SubscriptionForm({ open, onClose, onSubmit, initial, busy }) {
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setErr("");
      if (initial) {
        setForm({
          name: initial.name || "",
          category: initial.category || "streaming",
          price: initial.price ?? "",
          cycle: initial.cycle || "monthly",
          type: initial.type || "paid",
          renewal_date: initial.renewal_date ? initial.renewal_date.slice(0, 10) : "",
          notes: initial.notes || "",
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) return setErr("A name helps. Even just 'Spotify' works.");
    if (form.price === "" || Number(form.price) < 0) return setErr("Price must be a positive number.");
    if (!form.renewal_date) return setErr("Pick a renewal date.");
    await onSubmit({
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      notes: form.notes.trim() || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm fade-up"
      data-testid="sub-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg surface m-0 sm:m-6 rounded-t-card sm:rounded-card p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="heading text-2xl tracking-tight">
              {initial ? "Edit subscription" : "Add a subscription"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {initial ? "Update the details below." : "Just the essentials. You can edit later."}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost px-0" data-testid="sub-modal-close" aria-label="Close">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5" data-testid="sub-form">
          <div>
            <label className="label" htmlFor="sub-name">Name</label>
            <input
              id="sub-name"
              data-testid="sub-input-name"
              type="text"
              value={form.name}
              onChange={onChange("name")}
              className="field"
              placeholder="Netflix"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="sub-price">Price</label>
              <input
                id="sub-price"
                data-testid="sub-input-price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={onChange("price")}
                className="field"
                placeholder="9.99"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="sub-cycle">Cycle</label>
              <select
                id="sub-cycle"
                data-testid="sub-select-cycle"
                value={form.cycle}
                onChange={onChange("cycle")}
                className="field"
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="sub-category">Category</label>
              <select
                id="sub-category"
                data-testid="sub-select-category"
                value={form.category}
                onChange={onChange("category")}
                className="field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sub-type">Type</label>
              <select
                id="sub-type"
                data-testid="sub-select-type"
                value={form.type}
                onChange={onChange("type")}
                className="field"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="sub-renewal">Next renewal</label>
            <input
              id="sub-renewal"
              data-testid="sub-input-renewal"
              type="date"
              value={form.renewal_date}
              onChange={onChange("renewal_date")}
              className="field"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="sub-notes">Notes <span className="lowercase tracking-normal text-muted">(optional)</span></label>
            <textarea
              id="sub-notes"
              data-testid="sub-input-notes"
              value={form.notes}
              onChange={onChange("notes")}
              className="field min-h-[88px] resize-none"
              placeholder="Family plan, shared with Mark…"
            />
          </div>

          {err && <p className="text-sm text-danger" data-testid="sub-form-error">{err}</p>}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary" data-testid="sub-submit-btn">
              {busy ? "Saving…" : initial ? "Save changes" : "Add subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
