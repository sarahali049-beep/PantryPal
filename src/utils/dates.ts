import { differenceInDays, format, startOfWeek, addDays, parseISO } from 'date-fns';

export function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  return differenceInDays(parseISO(expiryDate), new Date());
}

export type ExpiryLevel = 'fresh' | 'soon' | 'urgent' | 'expired';

export function getExpiryLevel(expiryDate: string | null): ExpiryLevel {
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return 'fresh';
  if (days < 0) return 'expired';
  if (days <= 2) return 'urgent';
  if (days <= 5) return 'soon';
  return 'fresh';
}

export function getExpiryColor(level: ExpiryLevel): string {
  switch (level) {
    case 'fresh': return '#4CAF50';
    case 'soon': return '#FFC107';
    case 'urgent': return '#FF5722';
    case 'expired': return '#212121';
  }
}

export function formatDate(date: string | null): string {
  if (!date) return 'No expiry set';
  return format(parseISO(date), 'MMM d, yyyy');
}

export function getCurrentWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil((differenceInDays(start, jan1) + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

export function getWeekDays(weekId: string): { key: string; label: string; date: Date }[] {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan1 = new Date(year, 0, 1);
  const start = addDays(startOfWeek(jan1, { weekStartsOn: 1 }), (week - 1) * 7);

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return dayNames.map((key, i) => {
    const date = addDays(start, i);
    return { key, label: format(date, 'EEE M/d'), date };
  });
}
