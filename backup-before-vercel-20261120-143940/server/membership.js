// Membership expiry is derived from the joining date and selected duration.
// Work in UTC so the result is stable across server time zones and DST changes.
export function calculateExpiredDate(joiningDate, membershipDuration) {
  if (typeof joiningDate !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(joiningDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const original = new Date(Date.UTC(year, month - 1, day));
  if (
    original.getUTCFullYear() !== year ||
    original.getUTCMonth() !== month - 1 ||
    original.getUTCDate() !== day
  ) return null;

  const duration = String(membershipDuration ?? "").trim().match(/^(\d+)\s+(months?|years?)$/i);
  if (!duration) return null;

  const amount = Number(duration[1]);
  const unit = duration[2].toLowerCase();
  if (!Number.isSafeInteger(amount) || amount < 1) return null;

  let targetYear = year;
  let targetMonth = month - 1;
  if (unit.startsWith("month")) {
    const totalMonths = targetMonth + amount;
    targetYear += Math.floor(totalMonths / 12);
    targetMonth = totalMonths % 12;
  } else {
    targetYear += amount;
  }

  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
    .toISOString()
    .slice(0, 10);
}

export function withCalculatedExpiry(member) {
  const expired = calculateExpiredDate(member.joining_date, member.Membership_duration);
  return expired ? { ...member, expired } : member;
}
