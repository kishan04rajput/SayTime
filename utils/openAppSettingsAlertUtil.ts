import { Alert, Linking } from "react-native";

export const openAppSettingsAlertUtil = ({ title, message }: { title: string, message: string }) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Open Settings",
        onPress: () => Linking.openSettings()
      }
    ]
  );
}