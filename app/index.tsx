import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { askNotificationPermission, canAskAgainNotificationPermission, checkNotificationPermission, scheduleDailyNotification } from "../utils/notificationUtil";
import { openAppSettingsAlertUtil } from "../utils/openAppSettingsAlertUtil";

export default function App() {

  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const [showAppSettingsAlert, setShowAppSettingsAlert] = useState<boolean>(false);

  useEffect(() => {
    checkNotificationPermission()
      .then(() => {
        setNotificationPermission(true);
      })
      .catch(() => {
        canAskAgainNotificationPermission()
          .then(() => {
            askNotificationPermission()
              .then(() => {
                setNotificationPermission(true);
              })
              .catch(() => {
                setShowAppSettingsAlert(true);
              });
          })
          .catch(() => {
            setShowAppSettingsAlert(true);
          });
      });
  }, []);

  useEffect(() => {
    if (notificationPermission) {
      scheduleDailyNotification({
        hour: 0,
        minute: 0,
        title: "Look at that notification",
        body: "I'm so proud of myself!",
      });
    }
  }, [notificationPermission]);

  useEffect(() => {
    if (showAppSettingsAlert) {
      openAppSettingsAlertUtil({
        title: "Permission Required",
        message: "This app requires notification permission to function. Please enable it in your device settings."
      });
    }
  }, [showAppSettingsAlert]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "black"
      }}
    >
      <Text style={{ color: "white" }}> {notificationPermission ? "Say Time" : "Notification Permission Not Granted Restart The App"}</Text>
    </View>
  );
}
