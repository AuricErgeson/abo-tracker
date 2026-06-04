// Subscription helpers — pure functions, no I/O.

export const CATEGORIES = [
  "streaming",
  "music",
  "software",
  "fitness",
  "news",
  "gaming",
  "other",
];

export const CYCLES = ["monthly", "yearly", "weekly"];
export const TYPES = ["paid", "trial"];

export const CURRENCY = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n) || 0);

// returns integer number of days until renewal (negative if past)
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function urgency(days) {
  if (days === null || days === undefined) return "none";
  if (days <= 4) return "urgent";
  if (days <= 10) return "soon";
  return "ok";
}

export function monthlyEquivalent(sub) {
  const price = Number(sub.price) || 0;
  if (sub.cycle === "monthly") return price;
  if (sub.cycle === "yearly") return price / 12;
  if (sub.cycle === "weekly") return (price * 52) / 12;
  return price;
}

export function formatRenewal(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysLabel(d) {
  if (d === null) return "";
  if (d < 0) return `${Math.abs(d)} days overdue`;
  if (d === 0) return "Renews today";
  if (d === 1) return "Renews tomorrow";
  return `in ${d} days`;
}
