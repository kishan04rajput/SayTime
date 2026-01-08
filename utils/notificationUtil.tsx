import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Setup notification channel for Android with high priority
// This ensures notifications can wake the app in background
export const setupNotificationChannel = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("max", {
      name: "Time Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#64ffda",
      sound: null, // We're using TTS instead of sound
      enableVibrate: true,
      showBadge: true,
      enableLights: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    console.log("✅ Notification channel configured for background delivery");
  }
};

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
      sound: null, // Disable sound since we're using TTS
      priority: Notifications.AndroidNotificationPriority.MAX,
      vibrate: [0, 250, 250, 250],
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

