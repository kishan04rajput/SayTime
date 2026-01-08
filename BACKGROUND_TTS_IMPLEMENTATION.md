# Background TTS Implementation Guide

## Overview
This document explains how the SayTime app handles Text-to-Speech (TTS) for notifications in both foreground and background states.

## Implementation Details

### 1. **Notification Handler (`app/_layout.tsx`)**
The notification handler is configured to run when notifications are received, even when the app is in the background:

```tsx
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const body = notification.request.content.body;
    if (body) {
      speak(body); // Triggers TTS
    }
    return { shouldShowBanner: true, ... };
  },
});
```

**Key Points:**
- This handler runs **before** the notification is displayed
- It processes notifications in both foreground and background states
- The `speak()` function is called to announce the time

### 2. **Notification Channel Configuration (`utils/notificationUtil.tsx`)**
Android requires notification channels to be configured with proper priority:

```tsx
await Notifications.setNotificationChannelAsync("max", {
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  sound: null, // TTS instead of sound
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
});
```

**Key Points:**
- `MAX` importance ensures notifications wake the app
- No sound is used (we use TTS instead)
- Vibration provides feedback
- Public visibility allows notifications on lock screen

### 3. **Permissions (`app.json`)**
Required Android permissions for background operation:

```json
"permissions": [
  "RECEIVE_BOOT_COMPLETED",  // Restart notifications after reboot
  "VIBRATE",                 // Vibration feedback
  "WAKE_LOCK",               // Wake device for TTS
  "POST_NOTIFICATIONS",      // Show notifications
  "USE_EXACT_ALARM",         // Precise timing
  "SCHEDULE_EXACT_ALARM"     // Schedule exact alarms
]
```

## How It Works

### Foreground (App Open)
1. Notification is triggered by the system
2. `setNotificationHandler` receives the notification
3. `speak()` is called with the notification body
4. TTS announces the time ✅
5. Notification is displayed

### Background (App in Recent Apps)
1. Notification is triggered by the system
2. Android wakes the app's JavaScript runtime
3. `setNotificationHandler` receives the notification
4. `speak()` is called with the notification body
5. TTS announces the time ✅
6. Notification is displayed
7. App returns to background

### Killed (App Removed from Recent Apps)
1. Notification is triggered by the system
2. Android displays the notification
3. **JavaScript runtime is NOT running** ❌
4. TTS does NOT work ❌
5. Only notification is shown

## Limitations

### ⚠️ **App Must Be in Background (Not Killed)**
- **Works:** App is minimized but in recent apps list
- **Doesn't Work:** App is swiped away from recent apps
- **Reason:** React Native's JavaScript runtime is terminated when app is killed

### 🔋 **Battery Optimization**
Some Android manufacturers (Samsung, Xiaomi, Huawei, OnePlus) aggressively kill background apps:
- **Solution:** Users must disable battery optimization for SayTime
- **How:** Settings → Apps → SayTime → Battery → Unrestricted

### 📱 **Device-Specific Behavior**
- **Stock Android:** Works reliably in background
- **Samsung/Xiaomi:** May require "Auto-start" permission
- **Huawei:** May require "Protected apps" setting

## Testing Instructions

### Test 1: Foreground
1. Open the app
2. Wait for scheduled notification time
3. **Expected:** Notification appears + TTS speaks ✅

### Test 2: Background
1. Open the app
2. Press home button (app stays in recent apps)
3. Wait for scheduled notification time
4. **Expected:** Notification appears + TTS speaks ✅

### Test 3: Killed
1. Open the app
2. Swipe away from recent apps
3. Wait for scheduled notification time
4. **Expected:** Notification appears, NO TTS ❌

## Future Enhancements

### Option 1: Foreground Service (Recommended)
Create a persistent Android foreground service that:
- Keeps the app running in background
- Shows a persistent notification
- Guarantees TTS works even when app is killed

**Pros:**
- Reliable TTS in all states
- Works on all devices

**Cons:**
- Shows persistent notification
- Requires native Android code
- Higher battery usage

### Option 2: Native Module
Implement TTS directly in native Android code:
- No JavaScript runtime required
- Most reliable solution

**Pros:**
- Works in all states
- No persistent notification needed

**Cons:**
- Requires Java/Kotlin knowledge
- More complex implementation

## Troubleshooting

### TTS Not Working in Background?

1. **Check if app is in recent apps:**
   - Open recent apps menu
   - Verify SayTime is listed

2. **Disable battery optimization:**
   - Settings → Apps → SayTime → Battery
   - Select "Unrestricted"

3. **Check notification permissions:**
   - Settings → Apps → SayTime → Permissions
   - Ensure "Notifications" is enabled

4. **Check logs:**
   ```bash
   npx react-native log-android
   ```
   Look for: `🔊 Background notification received, speaking:`

5. **Rebuild the app:**
   ```bash
   npm run android
   ```

## Summary

✅ **What Works:**
- TTS in foreground (app open)
- TTS in background (app in recent apps)
- Scheduled notifications at exact times
- Multiple notification intervals

❌ **What Doesn't Work:**
- TTS when app is killed (removed from recent apps)
- TTS on devices with aggressive battery optimization (without user intervention)

🎯 **Best User Experience:**
- Instruct users to keep app in background
- Guide users to disable battery optimization
- Consider implementing foreground service for 100% reliability
