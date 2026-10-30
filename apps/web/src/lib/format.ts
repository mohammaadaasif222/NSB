const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const dateOnly = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** For date-only values such as "2027-02-14". */
export const formatDate = (isoDate: string) => dateOnly.format(new Date(`${isoDate}T00:00:00Z`));

/** "5m ago", "3h ago", "2d ago". */
export function ago(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}
