import { parseISO, differenceInDays, startOfMonth } from "date-fns";

export function calculateDayPosition(date: string, currentDate: Date): number {
  const taskDate = parseISO(date);
  const monthStart = startOfMonth(currentDate);
  return differenceInDays(taskDate, monthStart) + 1;
}

export function calculateTaskDuration(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return differenceInDays(end, start) + 1;
}