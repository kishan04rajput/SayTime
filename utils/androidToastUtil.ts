import { Platform, ToastAndroid } from "react-native";

export const showAndroidToast = ({ message, short = true, long = false }: { message: string, short?: boolean, long?: boolean }) => {
  if(Platform.OS === 'android') {
    ToastAndroid.show(message, long ? ToastAndroid.LONG : ToastAndroid.SHORT);
  }
}

export const showAndroidToastWithGravity = ({ message, short = true, long = false, top = false, center = false, bottom = true }: { message: string, short?: boolean, long?: boolean, top?: boolean, center?: boolean, bottom?: boolean }) => {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(message, long ? ToastAndroid.LONG : ToastAndroid.SHORT, top ? ToastAndroid.TOP : center ? ToastAndroid.CENTER : bottom ? ToastAndroid.BOTTOM : ToastAndroid.TOP);
  }
}

export const showAndroidToastWithGravityAndOffset = ({ message, short = true, long = false, top = false, center = false, bottom = true, xOffset = 0, yOffset = 0 }: { message: string, short?: boolean, long?: boolean, top?: boolean, center?: boolean, bottom?: boolean, xOffset?: number, yOffset?: number }) => {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravityAndOffset(message, long ? ToastAndroid.LONG : ToastAndroid.SHORT, top ? ToastAndroid.TOP : center ? ToastAndroid.CENTER : bottom ? ToastAndroid.BOTTOM : ToastAndroid.TOP, xOffset, yOffset);
  }
}