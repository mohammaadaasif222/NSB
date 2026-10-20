const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const dateOnly = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** For date-only values such as "2027-02-14". */
export const formatDate = (isoDate: string) => dateOnly.format(new Date(`${isoDate}T00:00:00Z`));
