import { useEffect } from "react";
import { Text, View } from "react-native";
import { checkNotificationPermission, scheduleDailyNotification } from "../utils/notificationUtil";

export default function App() {

  useEffect(() => {
    checkNotificationPermission().then((hasPermission) => {
      if (hasPermission) {
        scheduleDailyNotification();
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
