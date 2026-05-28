import { addDays, format, startOfDay, getDay, isBefore, isToday } from 'date-fns';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getAvailableDates(daysAhead: number, slotDays: number[]): Date[] {
  const dates: Date[] = [];
  const today = startOfDay(new Date());
  for (let i = 1; i <= daysAhead; i++) {
    const d = addDays(today, i);
    if (slotDays.includes(getDay(d))) {
      dates.push(d);
    }
  }
  return dates;
}

export function formatDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatDateShort(date: Date): string {
  return format(date, 'MMM d');
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
