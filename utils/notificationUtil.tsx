import * as Notifications from "expo-notifications";

export const scheduleDailyNotification = async ({
  hour,
  minute,
  title,
  body,
}: {
  hour: number;
  minute: number;
  title: string;
  body: string;
}) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "max",
    },
  });
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  const { granted } = await Notifications.getPermissionsAsync();
  return (granted) ? Promise.resolve(true) : Promise.reject(false);
};

export const canAskAgainNotificationPermission = async (): Promise<boolean> => {
  const { canAskAgain } = await Notifications.getPermissionsAsync();
  return (canAskAgain) ? Promise.resolve(true) : Promise.reject(false);
};

export const askNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return (status === "granted") ? Promise.resolve(true) : Promise.reject(false);
};

