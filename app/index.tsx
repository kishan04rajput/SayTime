import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function App() {

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

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      alert("Permission for notifications not granted");
    }
  };

  useEffect(() => {
    checkNotificationPermission();

    const interval = setInterval(() => {
      triggerNotification();
    }, 10000);

    return () => clearInterval(interval);
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
