import { useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

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
