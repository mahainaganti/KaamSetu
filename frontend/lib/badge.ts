const SUCCESS_VALUES = new Set(["available", "verified", "completed", "paid", "accepted", "open", "resolved"]);
const WARNING_VALUES = new Set(["pending", "busy", "assigned", "in progress", "processing"]);
const DANGER_VALUES = new Set(["unavailable", "rejected", "cancelled", "canceled", "refunded", "failed", "disputed"]);

export function statusVariant(value: string | null | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();
  if (SUCCESS_VALUES.has(normalized)) return "badge-success";
  if (WARNING_VALUES.has(normalized)) return "badge-warning";
  if (DANGER_VALUES.has(normalized)) return "badge-danger";
  return "badge-neutral";
}

export function stars(rating: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
