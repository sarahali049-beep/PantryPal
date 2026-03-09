import * as Notifications from 'expo-notifications';
import { PantryItem } from '@/types';
import { daysUntilExpiry } from '@/utils/dates';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpiryNotification(item: PantryItem): Promise<string | null> {
  if (!item.expiryDate) return null;

  const days = daysUntilExpiry(item.expiryDate);
  if (days === null || days < 0 || days > 3) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Item Expiring Soon!',
      body: `${item.name} expires in ${days} day${days !== 1 ? 's' : ''}`,
      data: { itemId: item.id },
    },
    trigger: null, // immediate
  });

  return id;
}

export async function scheduleExpiryReminders(items: PantryItem[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const item of items) {
    if (!item.expiryDate) continue;
    const days = daysUntilExpiry(item.expiryDate);
    if (days !== null && days >= 0 && days <= 3) {
      await scheduleExpiryNotification(item);
    }
  }
}
