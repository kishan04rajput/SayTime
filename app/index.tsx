import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { speak } from "../services/ttsService";

export default function Index() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    console.log(`${currentTime}`);
    if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "30" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 30 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "35" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 35 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "40" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 40 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "45" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 45 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "50" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 50 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "55" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 55 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "56" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 56 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "57" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 57 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "58" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 58 A M");
    } else if (
      currentTime.slice(0, 1) === "9" &&
      currentTime.slice(2, 4) === "59" &&
      currentTime.slice(5, 7) === "00"
    ) {
      speak("9 59 A M");
    } else if (
      currentTime.slice(0, 2) === "10" &&
      currentTime.slice(3, 5) === "00" &&
      currentTime.slice(6, 8) === "00"
    ) {
      speak("10 A M");
    }
  }, [currentTime]);

  setTimeout(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, 1000);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{currentTime}</Text>
    </View>
  );
}
