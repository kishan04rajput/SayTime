import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { speak } from "../utils/ttsUtil";

// This handler runs even when the app is in background
// It processes notifications and triggers TTS before displaying them
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Extract the notification body (the time message)
    const body = notification.request.content.body;
    
    // Speak the notification content in background
    if (body) {
      console.log("🔊 Background notification received, speaking:", body);
      speak(body);
    }
    
    return {
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
