import * as Notifications from "expo-notifications";

/**
 * Schedule a daily notification at a specific time
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute of the hour (0-59)
 * @param title - Notification title
 * @param body - Notification body
 * @param channelId - Android notification channel ID
 */
export const scheduleDailyNotification = async (
  hour: number = 0,
  minute: number = 0,
  title: string = "Look at that notification",
  body: string = "I'm so proud of myself!",
  channelId: string = "max"
) => {
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
      channelId,
    },
  });
};

/**
 * Check and request notification permissions
 * @returns Promise<boolean> - Whether permission is granted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = newStatus;
  }

  if (finalStatus !== "granted") {
    alert("Permission for notifications not granted");
    return false;
  }
  return true;
};
