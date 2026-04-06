// Helper to format date to YYYY-MM-DD in Asia/Makassar
export function todayYMD(d?: Date | string) {
  const date = d ? new Date(d) : new Date();

  // Use Intl to ensure correct timezone logic regardless of local system time
  const formatter = new Intl.DateTimeFormat("en-CA", { // en-CA gives YYYY-MM-DD
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

// Helper to get current HH:mm in Asia/Makassar
export function nowHM(d?: Date | string) {
  const date = d ? new Date(d) : new Date();

  // Intl for HH:mm
  const formatter = new Intl.DateTimeFormat("en-GB", { // en-GB gives HH:mm (24h)
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(date);
}

export function diffHMToHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const s = sh * 60 + sm
  let e = eh * 60 + em
  if (e < s) e += 24 * 60
  return (e - s) / 60
}

export function diffHMToMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}
