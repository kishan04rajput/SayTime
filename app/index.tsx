import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function App() {
  useEffect(() => {
    setInterval(() => {
      triggerNotification();
    }, 15000);
  }, []);

  const triggerNotification = () => {
    Notifications.cancelAllScheduledNotificationsAsync();
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Look at that notification",
        body: "I'm so proud of myself!",
      },
      trigger: null,
    });
  };

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
