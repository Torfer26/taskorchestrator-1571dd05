import { startOfMonth, differenceInDays, parseISO } from 'date-fns';

export function calculateDayPosition(date: string, currentDate: Date): number {
  const monthStart = startOfMonth(currentDate);
  const taskDate = parseISO(date);
  return differenceInDays(taskDate, monthStart) + 1;
}

export function calculateTaskDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}