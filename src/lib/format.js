import { FIRM_TIME_ZONE } from "@/constants/admin";

export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: FIRM_TIME_ZONE, ...options }).format(new Date(value));
}

export function formatDateTime(value, options = {}) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: FIRM_TIME_ZONE, ...options }).format(new Date(value));
}

export function formatTime(value, options = {}) {
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: FIRM_TIME_ZONE, ...options }).format(new Date(value));
}

export function firmWeekRange(referenceDate = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FIRM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const localDate = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  const mondayLocalMidnight = Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate() - daysSinceMonday);
  const start = new Date(mondayLocalMidnight - 330 * 60 * 1000);
  return { start, end: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) };
}
