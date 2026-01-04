import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { askNotificationPermission, canAskAgainNotificationPermission, checkNotificationPermission, scheduleNotificationWithoutCancel } from "../utils/notificationUtil";
import { openAppSettingsAlertUtil } from "../utils/openAppSettingsAlertUtil";
import { speak } from "../utils/ttsUtil";

// Default interval in minutes between notifications
const DEFAULT_INTERVAL = "5";
// Total duration in minutes to schedule notifications (30 minutes from start time)
const NOTIFICATION_DURATION = 30;

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const [showAppSettingsAlert, setShowAppSettingsAlert] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedHour, setSelectedHour] = useState<string>("10");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("AM");
  const [selectedInterval, setSelectedInterval] = useState<string>(DEFAULT_INTERVAL);

  // Generate notification intervals based on selected interval
  const generateNotificationIntervals = (intervalMinutes: number): number[] => {
    const intervals: number[] = [];
    for (let i = 0; i <= NOTIFICATION_DURATION; i += intervalMinutes) {
      intervals.push(i);
    }
    return intervals;
  };

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (hour12: string, ampm: string): number => {
    let hour = parseInt(hour12);
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    return hour;
  };

  // Convert 24-hour format back to 12-hour format with AM/PM
  const convertTo12Hour = (hour24: number, minute: number): { hour: string, minute: string, ampm: string } => {
    let hour = hour24;
    let ampm = 'AM';
    
    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    
    return {
      hour: hour.toString().padStart(2, '0'),
      minute: minute.toString().padStart(2, '0'),
      ampm
    };
  };

  // Calculate time with minute offset (handles hour rollover)
  const addMinutesToTime = (hour: number, minute: number, offsetMinutes: number): { hour: number, minute: number } => {
    let totalMinutes = hour * 60 + minute + offsetMinutes;
    // Handle day rollover (24 hours = 1440 minutes)
    totalMinutes = totalMinutes % 1440;
    
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60
    };
  };

  // Schedule multiple notifications based on intervals
  const scheduleMultipleNotifications = async (baseHour: number, baseMinute: number, intervalMinutes: number) => {
    const notificationIntervals = generateNotificationIntervals(intervalMinutes);
    
    // Cancel all existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log(`🔔 Scheduling ${notificationIntervals.length} notifications with ${intervalMinutes} min interval...`);
    
    // Schedule a notification for each interval
    for (const offset of notificationIntervals) {
      const { hour, minute } = addMinutesToTime(baseHour, baseMinute, offset);
      const { hour: hour12, minute: minute12, ampm } = convertTo12Hour(hour, minute);
      
      // Use the new function that doesn't cancel previous notifications
      await scheduleNotificationWithoutCancel({
        hour,
        minute,
        title: "⏰ Time Alert",
        body: `It's ${hour12}:${minute12} ${ampm}!`,
      });
      
      console.log(`✅ Scheduled: ${hour12}:${minute12} ${ampm}`);
    }
    
    console.log(`🎉 All ${notificationIntervals.length} notifications scheduled successfully!`);
  };

  // Load saved time from AsyncStorage on app start
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedHour = await AsyncStorage.getItem('selectedHour');
        const storedMinute = await AsyncStorage.getItem('selectedMinute');
        const storedAmPm = await AsyncStorage.getItem('selectedAmPm');
        const storedInterval = await AsyncStorage.getItem('selectedInterval');

        if (storedHour) setSelectedHour(storedHour);
        else await AsyncStorage.setItem('selectedHour', "10");
        
        if (storedMinute) setSelectedMinute(storedMinute);
        else await AsyncStorage.setItem('selectedMinute', "00");
        
        if (storedAmPm) setSelectedAmPm(storedAmPm);
        else await AsyncStorage.setItem('selectedAmPm', "AM");

        if (storedInterval) setSelectedInterval(storedInterval);
        else await AsyncStorage.setItem('selectedInterval', DEFAULT_INTERVAL);
      } catch (error) {
        console.error("Error loading saved time:", error);
      }
    };
    fetchData();
  }, []);

  // Handle notification permissions
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

  // Schedule notifications whenever time selection or interval changes, or permission is granted
  useEffect(() => {
    if (notificationPermission && selectedHour && selectedMinute && selectedAmPm && selectedInterval) {
      const hour24 = convertTo24Hour(selectedHour, selectedAmPm);
      const minute = parseInt(selectedMinute);
      const interval = parseInt(selectedInterval);
      
      scheduleMultipleNotifications(hour24, minute, interval);
    }
  }, [notificationPermission, selectedHour, selectedMinute, selectedAmPm, selectedInterval]);

  // Show app settings alert if needed
  useEffect(() => {
    if (showAppSettingsAlert) {
      openAppSettingsAlertUtil({
        title: "Permission Required",
        message: "This app requires notification permission to function. Please enable it in your device settings."
      });
    }
  }, [showAppSettingsAlert]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for notifications and speak the content
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const body = notification.request.content.body;
      if (body) {
        speak(body);
      }
    });

    return () => subscription.remove();
  }, []);

  const updateSelectedHour = async (e: any) => {
    setSelectedHour(e.value);
    await AsyncStorage.setItem('selectedHour', e.value);
  };

  const updateSelectedMinute = async (e: any) => {
    setSelectedMinute(e.value);
    await AsyncStorage.setItem('selectedMinute', e.value);
  };

  const updateSelectedAmPm = async (e: any) => {
    setSelectedAmPm(e.value);
    await AsyncStorage.setItem('selectedAmPm', e.value);
  };

  const updateSelectedInterval = async (e: any) => {
    setSelectedInterval(e.value);
    await AsyncStorage.setItem('selectedInterval', e.value);
  };

  const ampm = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' },
  ];

  const intervalOptions = [
    { label: '1 min', value: '1' },
    { label: '5 min', value: '5' },
    { label: '10 min', value: '10' },
    { label: '15 min', value: '15' },
    { label: '30 min', value: '30' },
  ];
  
  const hour = [
    { label: '01', value: '01' },
    { label: '02', value: '02' },
    { label: '03', value: '03' },
    { label: '04', value: '04' },
    { label: '05', value: '05' },
    { label: '06', value: '06' },
    { label: '07', value: '07' },
    { label: '08', value: '08' },
    { label: '09', value: '09' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
  ];
  
  const minute = [
    { label: '00', value: '00' },
    { label: '01', value: '01' },
    { label: '02', value: '02' },
    { label: '03', value: '03' },
    { label: '04', value: '04' },
    { label: '05', value: '05' },
    { label: '06', value: '06' },
    { label: '07', value: '07' },
    { label: '08', value: '08' },
    { label: '09', value: '09' },
    { label: '10', value: '10' },
    { label: '11', value: '11' },
    { label: '12', value: '12' },
    { label: '13', value: '13' },
    { label: '14', value: '14' },
    { label: '15', value: '15' },
    { label: '16', value: '16' },
    { label: '17', value: '17' },
    { label: '18', value: '18' },
    { label: '19', value: '19' },
    { label: '20', value: '20' },
    { label: '21', value: '21' },
    { label: '22', value: '22' },
    { label: '23', value: '23' },
    { label: '24', value: '24' },
    { label: '25', value: '25' },
    { label: '26', value: '26' },
    { label: '27', value: '27' },
    { label: '28', value: '28' },
    { label: '29', value: '29' },
    { label: '30', value: '30' },
    { label: '31', value: '31' },
    { label: '32', value: '32' },
    { label: '33', value: '33' },
    { label: '34', value: '34' },
    { label: '35', value: '35' },
    { label: '36', value: '36' },
    { label: '37', value: '37' },
    { label: '38', value: '38' },
    { label: '39', value: '39' },
    { label: '40', value: '40' },
    { label: '41', value: '41' },
    { label: '42', value: '42' },
    { label: '43', value: '43' },
    { label: '44', value: '44' },
    { label: '45', value: '45' },
    { label: '46', value: '46' },
    { label: '47', value: '47' },
    { label: '48', value: '48' },
    { label: '49', value: '49' },
    { label: '50', value: '50' },
    { label: '51', value: '51' },
    { label: '52', value: '52' },
    { label: '53', value: '53' },
    { label: '54', value: '54' },
    { label: '55', value: '55' },
    { label: '56', value: '56' },
    { label: '57', value: '57' },
    { label: '58', value: '58' },
    { label: '59', value: '59' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>⏰ SayTime</Text>
          <Text style={styles.subtitle}>Set your daily notification</Text>
        </View>

        {/* Current Time Display */}
        <View style={styles.currentTimeContainer}>
          <Text style={styles.currentTimeLabel}>Current Time</Text>
          <Text style={styles.currentTime}>{currentTime}</Text>
        </View>

        {/* Time Selector Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Time</Text>
          
          <View style={styles.timePickerContainer}>
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Hour</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                data={hour}
                labelField="label"
                valueField="value"
                placeholder={selectedHour}
                value={selectedHour}
                onChange={updateSelectedHour}
              />
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Minute</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                data={minute}
                labelField="label"
                valueField="value"
                placeholder={selectedMinute}
                value={selectedMinute}
                onChange={updateSelectedMinute}
              />
            </View>

            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>AM/PM</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                data={ampm}
                labelField="label"
                valueField="value"
                placeholder={selectedAmPm}
                value={selectedAmPm}
                onChange={updateSelectedAmPm}
              />
            </View>
          </View>

          {/* Selected Time Display */}
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTimeLabel}>Scheduled for:</Text>
            <Text style={styles.selectedTime}>
              {selectedHour}:{selectedMinute} {selectedAmPm}
            </Text>
          </View>
        </View>

        {/* Interval Selector Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Interval</Text>
          <Text style={styles.intervalDescription}>
            How often should notifications repeat?
          </Text>
          
          <View style={styles.intervalDropdownWrapper}>
            <Dropdown
              style={styles.intervalDropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.selectedTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemTextStyle={styles.itemTextStyle}
              data={intervalOptions}
              labelField="label"
              valueField="value"
              placeholder={`${selectedInterval} min`}
              value={selectedInterval}
              onChange={updateSelectedInterval}
            />
          </View>
          
          <Text style={styles.intervalInfo}>
            Notifications will be sent every {selectedInterval} minute(s) for 30 minutes
          </Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusContainer}>
          {notificationPermission ? (
            <>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusText}>Ready to notify!</Text>
              <Text style={styles.statusSubtext}>
                You'll receive notifications every day at:
              </Text>
              <View style={styles.notificationTimesContainer}>
                {generateNotificationIntervals(parseInt(selectedInterval)).map((offsetMinutes, index) => {
                  const hour24 = convertTo24Hour(selectedHour, selectedAmPm);
                  const minute = parseInt(selectedMinute);
                  const { hour, minute: adjustedMinute } = addMinutesToTime(hour24, minute, offsetMinutes);
                  const { hour: hour12, minute: minute12, ampm } = convertTo12Hour(hour, adjustedMinute);
                  
                  return (
                    <Text key={index} style={styles.notificationTimeItem}>
                      {hour12}:{minute12} {ampm}
                    </Text>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.statusIcon}>⚠️</Text>
              <Text style={styles.statusTextError}>Permission Required</Text>
              <Text style={styles.statusSubtext}>
                Please grant notification permission and restart the app
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8b2d1',
    letterSpacing: 0.5,
  },
  currentTimeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentTimeLabel: {
    fontSize: 14,
    color: '#a8b2d1',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#64ffda',
    fontVariant: ['tabular-nums'],
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#a8b2d1',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdown: {
    height: 54,
    borderColor: 'rgba(100, 255, 218, 0.3)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownContainer: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    borderColor: 'rgba(100, 255, 218, 0.3)',
    borderWidth: 1,
  },
  placeholderStyle: {
    fontSize: 18,
    color: '#64ffda',
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedTextStyle: {
    fontSize: 18,
    color: '#64ffda',
    textAlign: 'center',
    fontWeight: '600',
  },
  itemTextStyle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 32,
    color: '#64ffda',
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 4,
  },
  selectedTimeContainer: {
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.2)',
  },
  selectedTimeLabel: {
    fontSize: 13,
    color: '#a8b2d1',
    marginBottom: 6,
    letterSpacing: 1,
  },
  selectedTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64ffda',
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64ffda',
    marginBottom: 8,
  },
  statusTextError: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#a8b2d1',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  notificationTimeItem: {
    backgroundColor: 'rgba(100, 255, 218, 0.15)',
    color: '#64ffda',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.3)',
  },
  intervalDescription: {
    fontSize: 14,
    color: '#a8b2d1',
    textAlign: 'center',
    marginBottom: 16,
  },
  intervalDropdownWrapper: {
    marginBottom: 16,
  },
  intervalDropdown: {
    height: 54,
    borderColor: 'rgba(100, 255, 218, 0.3)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  intervalInfo: {
    fontSize: 13,
    color: '#64ffda',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});