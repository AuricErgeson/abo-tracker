import React from "react";
import { CURRENCY, daysUntil, urgency, formatRenewal, daysLabel } from "../lib/sub";

const URGENCY_BAR = {
  urgent: "bg-danger",
  soon: "bg-warning",
  ok: "bg-transparent",
  none: "bg-transparent",
};

const URGENCY_LABEL_CLS = {
  urgent: "text-danger",
  soon: "text-warning",
  ok: "text-muted",
  none: "text-muted",
};

export default function SubscriptionCard({ sub, onEdit, onDelete }) {
  const d = daysUntil(sub.renewal_date);
  const u = urgency(d);

  return (
    <div
      className="relative surface p-5 sm:p-6 hover:border-ink/30 dark:hover:border-ink-dark/30 transition-colors duration-150"
      data-testid={`sub-card-${sub.id}`}
    >
      <span className={`urgency-bar ${URGENCY_BAR[u]}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="heading text-xl sm:text-2xl tracking-tight truncate" data-testid={`sub-name-${sub.id}`}>
              {sub.name}
            </h3>
            {sub.type === "trial" && (
              <span className="tag tag--trial" data-testid={`sub-trial-${sub.id}`}>Trial</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="tag" data-testid={`sub-category-${sub.id}`}>{sub.category}</span>
            <span className="tag">{sub.cycle}</span>
          </div>
          <p className="text-sm text-muted">
            <span data-testid={`sub-renewal-${sub.id}`}>Renews {formatRenewal(sub.renewal_date)}</span>
            {" · "}
            <span className={URGENCY_LABEL_CLS[u]} data-testid={`sub-days-${sub.id}`}>
              {daysLabel(d)}
            </span>
          </p>
          {sub.notes && (
            <p className="text-sm text-muted mt-3 leading-relaxed italic">"{sub.notes}"</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="heading text-2xl sm:text-3xl tracking-tight" data-testid={`sub-price-${sub.id}`}>
            {CURRENCY(sub.price)}
          </p>
          <p className="text-xs text-muted tracking-wide uppercase mt-1">/ {sub.cycle.replace("ly", "")}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-5 pt-4 border-t border-line dark:border-line-dark">
        <button
          type="button"
          onClick={() => onEdit(sub)}
          className="btn-ghost px-3"
          data-testid={`sub-edit-${sub.id}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(sub)}
          className="btn-ghost px-3 hover:text-danger"
          data-testid={`sub-delete-${sub.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
