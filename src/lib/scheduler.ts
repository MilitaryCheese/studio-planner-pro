import { ScheduledProject, ProjectType } from "./types";

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function findNextAvailableStart(
  existing: ScheduledProject[],
  duration: number,
  projectTypes: ProjectType[],
  newProjectType: string,
  preferredStart?: string
): { startDate: string; endDate: string } | null {
  const newType = projectTypes.find((t) => t.key === newProjectType);
  const newIsIntensive = newType?.isIntensive ?? false;

  let candidate = preferredStart ? parseDate(preferredStart) : new Date();
  // Ensure we start on a weekday
  while (candidate.getDay() === 0 || candidate.getDay() === 6) {
    candidate.setDate(candidate.getDate() + 1);
  }

  const maxAttempts = 365;
  for (let i = 0; i < maxAttempts; i++) {
    const end = addBusinessDays(candidate, duration - 1);
    const candidateStr = formatDate(candidate);
    const endStr = formatDate(end);

    const conflict = existing.some((p) => {
      const overlaps = candidateStr <= p.endDate && endStr >= p.startDate;
      if (!overlaps) return false;

      // Allow overlap if BOTH the new project and existing project are intensive
      const existingType = projectTypes.find((t) => t.key === p.type);
      const existingIsIntensive = existingType?.isIntensive ?? false;

      if (newIsIntensive && existingIsIntensive) return false;

      return true;
    });

    if (!conflict) {
      return { startDate: candidateStr, endDate: endStr };
    }

    candidate.setDate(candidate.getDate() + 1);
    while (candidate.getDay() === 0 || candidate.getDay() === 6) {
      candidate.setDate(candidate.getDate() + 1);
    }
  }

  // Could not find a slot
  return null;
}

export function getQuarterRange(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return { start: formatDate(start), end: formatDate(end) };
}

export function getBusinessDaysInRange(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function getMonthsInQuarter(year: number, quarter: number): { name: string; start: string; end: string }[] {
  const startMonth = (quarter - 1) * 3;
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return [0, 1, 2].map((offset) => {
    const month = startMonth + offset;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return {
      name: monthNames[month],
      start: formatDate(start),
      end: formatDate(end),
    };
  });
}
