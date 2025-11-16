import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { showToast } from "../services/toastService";
import { speak } from "../services/ttsService";

export default function Index() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [selectedHour, setSelectedHour] = useState(String);
  const [selectedMinute, setSelectedMinute] = useState(String);
  const [selectedAmPm, setSelectedAmPm] = useState(String);

  const ampm = [
    { label: "AM", value: "am" },
    { label: "PM", value: "pm" },
  ];
  const hour = [
    { label: "01", value: "01" },
    { label: "02", value: "02" },
    { label: "03", value: "03" },
    { label: "04", value: "04" },
    { label: "05", value: "05" },
    { label: "06", value: "06" },
    { label: "07", value: "07" },
    { label: "08", value: "08" },
    { label: "09", value: "09" },
    { label: "10", value: "10" },
    { label: "11", value: "11" },
    { label: "12", value: "12" },
  ];
  const minute = [
    { label: "00", value: "00" },
    { label: "01", value: "01" },
    { label: "02", value: "02" },
    { label: "03", value: "03" },
    { label: "04", value: "04" },
    { label: "05", value: "05" },
    { label: "06", value: "06" },
    { label: "07", value: "07" },
    { label: "08", value: "08" },
    { label: "09", value: "09" },
    { label: "10", value: "10" },
    { label: "11", value: "11" },
    { label: "12", value: "12" },
    { label: "13", value: "13" },
    { label: "14", value: "14" },
    { label: "15", value: "15" },
    { label: "16", value: "16" },
    { label: "17", value: "17" },
    { label: "18", value: "18" },
    { label: "19", value: "19" },
    { label: "20", value: "20" },
    { label: "21", value: "21" },
    { label: "22", value: "22" },
    { label: "23", value: "23" },
    { label: "24", value: "24" },
    { label: "25", value: "25" },
    { label: "26", value: "26" },
    { label: "27", value: "27" },
    { label: "28", value: "28" },
    { label: "29", value: "29" },
    { label: "30", value: "30" },
    { label: "31", value: "31" },
    { label: "32", value: "32" },
    { label: "33", value: "33" },
    { label: "34", value: "34" },
    { label: "35", value: "35" },
    { label: "36", value: "36" },
    { label: "37", value: "37" },
    { label: "38", value: "38" },
    { label: "39", value: "39" },
    { label: "40", value: "40" },
    { label: "41", value: "41" },
    { label: "42", value: "42" },
    { label: "43", value: "43" },
    { label: "44", value: "44" },
    { label: "45", value: "45" },
    { label: "46", value: "46" },
    { label: "47", value: "47" },
    { label: "48", value: "48" },
    { label: "49", value: "49" },
    { label: "50", value: "50" },
    { label: "51", value: "51" },
    { label: "52", value: "52" },
    { label: "53", value: "53" },
    { label: "54", value: "54" },
    { label: "55", value: "55" },
    { label: "56", value: "56" },
    { label: "57", value: "57" },
    { label: "58", value: "58" },
    { label: "59", value: "59" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

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

  const fetchData = async () => {
    const storedHour = await AsyncStorage.getItem("selectedHour");
    const storedMinute = await AsyncStorage.getItem("selectedMinute");
    const storedAmPm = await AsyncStorage.getItem("selectedAmPm");

    if (storedHour) setSelectedHour(storedHour);
    else {
      setSelectedHour("10");
      await AsyncStorage.setItem("selectedHour", "10");
      showToast("Default hour set to 10");
    }
    if (storedMinute) setSelectedMinute(storedMinute);
    else {
      setSelectedMinute("00");
      await AsyncStorage.setItem("selectedMinute", "00");
      showToast("Default minute set to 00");
    }
    if (storedAmPm) setSelectedAmPm(storedAmPm);
    else {
      setSelectedAmPm("am");
      await AsyncStorage.setItem("selectedAmPm", "am");
      showToast("Default AM/PM set to AM");
    }
  };

  setTimeout(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, 1000);

  const updateSelectedHour = async (e: any) => {
    setSelectedHour(e.value);
    await AsyncStorage.setItem("selectedHour", e.value);
  };

  const updateSelectedMinute = async (e: any) => {
    setSelectedMinute(e.value);
    await AsyncStorage.setItem("selectedMinute", e.value);
  };

  const updateSelectedAmPm = async (e: any) => {
    setSelectedAmPm(e.value);
    await AsyncStorage.setItem("selectedAmPm", e.value);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Dropdown
        style={{
          width: 100,
          height: 50,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
        data={hour}
        labelField="label"
        valueField="value"
        placeholder={selectedHour}
        onChange={(e) => {
          updateSelectedHour(e);
        }}
      />
      <Dropdown
        style={{
          width: 100,
          height: 50,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
        data={minute}
        labelField="label"
        valueField="value"
        placeholder={selectedMinute}
        onChange={(e) => {
          updateSelectedMinute(e);
        }}
      />
      <Dropdown
        style={{
          width: 100,
          height: 50,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
        data={ampm}
        labelField="label"
        valueField="value"
        placeholder={selectedAmPm}
        onChange={(e) => {
          updateSelectedAmPm(e);
        }}
      />
      <Text>{currentTime}</Text>
    </View>
  );
}
