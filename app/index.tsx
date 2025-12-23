import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function App() {

  const triggerNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Look at that notification",
        body: "I'm so proud of myself!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30,
        repeats: true,
      },
    });
  };

  const checkNotificationPermission = async () => {
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

  useEffect(() => {
    checkNotificationPermission().then((hasPermission) => {
      if (hasPermission) {
          triggerNotification();
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "black"
      }}
    >
      <Text style={{ color: "white" }}>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}
