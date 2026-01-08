# Foreground Service Implementation Guide

## Overview
This implementation uses an Android foreground service to ensure time announcements work **even when the app is completely killed** (removed from recent apps). This is the most reliable solution for background TTS.

## How It Works

### Architecture
```
React Native (JavaScript)
        ↓
Native Module Bridge (TimeAnnouncementModule)
        ↓
Foreground Service (TimeAnnouncementService)
        ↓
AlarmManager + Native TTS
```

### Components

1. **Foreground Service** (`TimeAnnouncementService.kt`)
   - Runs continuously in the background
   - Shows a persistent notification
   - Manages scheduled alarms using AlarmManager
   - Uses native Android TTS engine

2. **Broadcast Receiver** (`TimeAnnouncementReceiver.kt`)
   - Receives alarm broadcasts
   - Triggers TTS announcements
   - Handles device reboot events

3. **React Native Module** (`TimeAnnouncementModule.kt`)
   - Bridges JavaScript ↔ Native Android
   - Exposes `startService()`, `stopService()`, `updateSchedule()`

4. **Expo Config Plugin** (`withTimeAnnouncementService.js`)
   - Automatically modifies AndroidManifest.xml during prebuild
   - Adds necessary permissions
   - Registers service and receiver
   - Modifies MainApplication.kt to register the module

5. **JavaScript Wrapper** (`foregroundServiceUtil.ts`)
   - Type-safe TypeScript interface
   - Convenient methods for React Native code

## Implementation Details

### 1. Expo Config Plugin
The plugin automatically configures the Android app during `expo prebuild`:

**Permissions Added:**
- `FOREGROUND_SERVICE` - Run foreground service
- `FOREGROUND_SERVICE_SPECIAL_USE` - Special use case for accessibility
- `WAKE_LOCK` - Wake device for TTS
- `RECEIVE_BOOT_COMPLETED` - Restart after reboot
- `SCHEDULE_EXACT_ALARM` - Precise timing
- `USE_EXACT_ALARM` - Use exact alarms
- `POST_NOTIFICATIONS` - Show notifications

**AndroidManifest.xml Modifications:**
```xml
<service
    android:name=".TimeAnnouncementService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="specialUse">
    <property
        android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
        android:value="Time announcement service for accessibility" />
</service>

<receiver
    android:name=".TimeAnnouncementReceiver"
    android:enabled="true"
    android:exported="false">
    <intent-filter>
        <action android:name="com.android.sayTime.ANNOUNCE_TIME" />
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

### 2. Foreground Service Lifecycle

**Service Starts:**
1. User opens app and sets notification time
2. React Native calls `startForegroundService(schedule)`
3. Native module starts `TimeAnnouncementService`
4. Service shows persistent notification: "⏰ SayTime Active"
5. Service schedules alarms using AlarmManager

**Alarm Triggers:**
1. AlarmManager triggers at scheduled time
2. `TimeAnnouncementReceiver` receives broadcast
3. Receiver starts service with `ACTION_ANNOUNCE_TIME`
4. Service uses native TTS to speak the time
5. Service continues running for next alarm

**Service Stops:**
1. User explicitly stops the service (future feature)
2. Or app is uninstalled
3. Service cancels all alarms and shuts down TTS

### 3. Native TTS vs React Native TTS

**Native TTS (Used in Foreground Service):**
- ✅ Works when app is killed
- ✅ More reliable in background
- ✅ Lower battery usage
- ✅ No JavaScript runtime required

**React Native TTS (Used in Headless Branch):**
- ❌ Requires JavaScript runtime
- ❌ Doesn't work when app is killed
- ✅ Easier to implement
- ✅ Works in foreground and background (if app in recent apps)

## Usage

### Starting the Service

```typescript
import { startForegroundService, type TimeSchedule } from '../utils/foregroundServiceUtil';

const schedule: TimeSchedule[] = [
  { hour: 10, minute: 0, message: "It's 10:00 AM!" },
  { hour: 10, minute: 5, message: "It's 10:05 AM!" },
  { hour: 10, minute: 10, message: "It's 10:10 AM!" },
];

await startForegroundService(schedule);
```

### Updating the Schedule

```typescript
import { updateServiceSchedule } from '../utils/foregroundServiceUtil';

const newSchedule: TimeSchedule[] = [
  { hour: 14, minute: 0, message: "It's 2:00 PM!" },
];

await updateServiceSchedule(newSchedule);
```

### Stopping the Service

```typescript
import { stopForegroundService } from '../utils/foregroundServiceUtil';

await stopForegroundService();
```

## Building the App

### Important: Prebuild Required

Since we're using a custom Expo config plugin, you **must** run prebuild before building:

```bash
# Clean prebuild (recommended)
npx expo prebuild --clean --platform android

# Then build
npm run android
```

### What Happens During Prebuild

1. Expo generates the `android/` folder
2. Config plugin runs and modifies:
   - `AndroidManifest.xml` - Adds permissions and components
   - `MainApplication.kt` - Registers the native module
3. Native Kotlin files are copied to the correct location
4. App is ready to build

### Building for Production

```bash
# Local build
npm run epal

# Or EAS build
eas build --platform android --profile production
```

## Testing

### Test 1: Foreground
1. Open the app
2. Set a notification for 1-2 minutes from now
3. Keep app open
4. **Expected:** 
   - Persistent notification appears: "⏰ SayTime Active"
   - At scheduled time: TTS speaks ✅

### Test 2: Background
1. Open the app
2. Set a notification
3. Press home button (app in recent apps)
4. **Expected:**
   - Persistent notification visible
   - At scheduled time: TTS speaks ✅

### Test 3: Killed (Main Test)
1. Open the app
2. Set a notification
3. Swipe away from recent apps (kill the app)
4. **Expected:**
   - Persistent notification still visible
   - At scheduled time: TTS speaks ✅ (This is the key difference!)

### Test 4: After Reboot
1. Set up notifications
2. Reboot device
3. **Expected:**
   - Service restarts automatically
   - TTS continues to work ✅

## Persistent Notification

The foreground service shows a persistent notification:

**Title:** ⏰ SayTime Active  
**Text:** Time announcements are running  
**Icon:** Alarm clock icon  
**Priority:** Low (doesn't disturb user)  
**Sound:** None  
**Ongoing:** Yes (can't be swiped away)

**Why is it needed?**
- Android requires foreground services to show a notification
- This is a platform requirement for services that run continuously
- Users can see that the app is active and managing time announcements

## Troubleshooting

### Service Not Starting?

1. **Check logs:**
   ```bash
   npx react-native log-android
   ```
   Look for: `🚀 Starting service with schedule`

2. **Verify prebuild:**
   ```bash
   npx expo prebuild --clean --platform android
   ```

3. **Check permissions:**
   - Settings → Apps → SayTime → Permissions
   - Ensure all permissions are granted

### TTS Not Working?

1. **Check TTS initialization:**
   Look for log: `✅ TTS initialized successfully`

2. **Test device TTS:**
   - Settings → Accessibility → Text-to-Speech
   - Test if TTS works system-wide

3. **Check alarm scheduling:**
   Look for logs: `⏰ Scheduled alarm for...`

### Persistent Notification Not Showing?

1. **Check notification permissions:**
   - Settings → Apps → SayTime → Notifications
   - Enable notifications

2. **Check logs:**
   Look for: `✅ Foreground service started`

### Service Stops After App is Killed?

1. **Disable battery optimization:**
   - Settings → Apps → SayTime → Battery
   - Select "Unrestricted"

2. **Check manufacturer settings:**
   - Samsung: Settings → Apps → SayTime → Battery → Allow background activity
   - Xiaomi: Settings → Apps → Manage apps → SayTime → Autostart
   - Huawei: Settings → Apps → SayTime → Battery → Protected apps

## Comparison: Headless vs Foreground Service

| Feature | Headless Task | Foreground Service |
|---------|---------------|-------------------|
| Works in foreground | ✅ | ✅ |
| Works in background | ✅ | ✅ |
| Works when killed | ❌ | ✅ |
| Persistent notification | ❌ | ✅ (Required) |
| Battery usage | Lower | Slightly higher |
| Reliability | Medium | High |
| Implementation complexity | Low | Medium |
| User experience | Better (no notification) | Good (shows active status) |

## Best Practices

1. **Always run prebuild after modifying the config plugin:**
   ```bash
   npx expo prebuild --clean --platform android
   ```

2. **Don't manually edit the `android/` folder:**
   - All changes should be in the config plugin
   - The `android/` folder is regenerated on prebuild

3. **Test on multiple devices:**
   - Different manufacturers have different battery optimization policies
   - Test on Samsung, Xiaomi, OnePlus, etc.

4. **Inform users about the persistent notification:**
   - Explain why it's necessary
   - Show them how to minimize notification priority if desired

5. **Handle service lifecycle properly:**
   - Start service when user sets up notifications
   - Stop service when user disables notifications (future feature)

## Future Enhancements

1. **Add service status indicator in UI:**
   - Show if service is running
   - Display next scheduled announcement

2. **Add manual stop button:**
   - Allow users to stop the service
   - Clear all scheduled alarms

3. **Customize persistent notification:**
   - Show next announcement time
   - Add quick actions (snooze, stop)

4. **Add service health monitoring:**
   - Detect if service is killed
   - Auto-restart if needed

5. **Optimize battery usage:**
   - Use JobScheduler for less critical tasks
   - Implement doze mode handling

## Summary

✅ **What Works:**
- TTS in foreground (app open)
- TTS in background (app in recent apps)
- TTS when app is killed (removed from recent apps) ⭐
- TTS after device reboot
- Scheduled announcements at exact times
- Multiple notification intervals

❌ **Limitations:**
- Shows persistent notification (Android requirement)
- Requires battery optimization to be disabled on some devices
- Slightly higher battery usage than headless approach

🎯 **Best For:**
- Users who need 100% reliable time announcements
- Accessibility use cases
- Users who don't mind a persistent notification
- Production apps requiring maximum reliability
