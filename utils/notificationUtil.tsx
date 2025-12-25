import * as Notifications from "expo-notifications";

// Schedule a notification without canceling existing ones
export const scheduleNotificationWithoutCancel = async ({
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

// Schedule a daily notification (cancels all existing notifications first)
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
  await scheduleNotificationWithoutCancel({ hour, minute, title, body });
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

