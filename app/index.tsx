import { useEffect } from "react";
import { Text, View } from "react-native";
import { askNotificationPermission, canAskAgainNotificationPermission, checkNotificationPermission, scheduleDailyNotification } from "../utils/notificationUtil";
import { openAppSettingsAlertUtil } from "../utils/openAppSettingsAlertUtil";

export default function App() {

  useEffect(() => {
    checkNotificationPermission()
      .then(() => {
        scheduleDailyNotification({
          hour: 0,
          minute: 0,
          title: "Look at that notification",
          body: "I'm so proud of myself!",
        });
      })
      .catch(() => {
        canAskAgainNotificationPermission()
          .then(() => {
            askNotificationPermission()
              .then(() => {
                scheduleDailyNotification({
                  hour: 0,
                  minute: 0,
                  title: "Look at that notification",
                  body: "I'm so proud of myself!",
                });
              })
              .catch(() => {
                openAppSettingsAlertUtil({
                  title: "Permission Required",
                  message: "This app requires notification permission to function. Please enable it in your device settings."
                });
              });
          })
          .catch(() => {
            openAppSettingsAlertUtil({
              title: "Permission Required",
              message: "This app requires notification permission to function. Please enable it in your device settings."
            });
          });
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
      <Text style={{ color: "white" }}> { checkNotificationPermission().then(() => { return "Say Time" }).catch(() => { return "Notification Permission Not Granted" })}</Text>
    </View>
  );
}
