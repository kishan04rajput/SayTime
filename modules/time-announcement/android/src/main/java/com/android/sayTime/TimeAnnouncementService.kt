package com.android.sayTime

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.util.*

class TimeAnnouncementService : Service(), TextToSpeech.OnInitListener {
    
    private var tts: TextToSpeech? = null
    private var alarmManager: AlarmManager? = null
    private val TAG = "TimeAnnouncementService"
    private val CHANNEL_ID = "time_announcement_service"
    private val NOTIFICATION_ID = 1001
    private val scheduledAlarms = mutableListOf<PendingIntent>()
    
    companion object {
        const val ACTION_START_SERVICE = "com.android.sayTime.START_SERVICE"
        const val ACTION_STOP_SERVICE = "com.android.sayTime.STOP_SERVICE"
        const val ACTION_ANNOUNCE_TIME = "com.android.sayTime.ANNOUNCE_TIME"
        const val EXTRA_SCHEDULE_DATA = "schedule_data"
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "🚀 Service onCreate")
        
        // Initialize TTS
        tts = TextToSpeech(this, this)
        alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        
        // Create notification channel
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "📱 Service onStartCommand: ${intent?.action}")
        
        when (intent?.action) {
            ACTION_START_SERVICE -> {
                startForegroundService()
                val scheduleData = intent.getStringExtra(EXTRA_SCHEDULE_DATA)
                if (scheduleData != null) {
                    scheduleAnnouncements(scheduleData)
                }
            }
            ACTION_STOP_SERVICE -> {
                stopForegroundService()
            }
            ACTION_ANNOUNCE_TIME -> {
                val timeMessage = intent.getStringExtra("time_message")
                if (timeMessage != null) {
                    announceTime(timeMessage)
                }
            }
        }
        
        // If service is killed, restart it
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "❌ TTS language not supported")
            } else {
                Log.d(TAG, "✅ TTS initialized successfully")
            }
            
            // Set up utterance listener
            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    Log.d(TAG, "🔊 TTS started speaking: $utteranceId")
                }
                
                override fun onDone(utteranceId: String?) {
                    Log.d(TAG, "✅ TTS finished speaking: $utteranceId")
                }
                
                override fun onError(utteranceId: String?) {
                    Log.e(TAG, "❌ TTS error: $utteranceId")
                }
            })
        } else {
            Log.e(TAG, "❌ TTS initialization failed")
        }
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Time Announcement Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps SayTime running to announce time"
                setShowBadge(false)
                setSound(null, null)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
            Log.d(TAG, "✅ Notification channel created")
        }
    }
    
    private fun startForegroundService() {
        val notificationIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("⏰ SayTime Active")
            .setContentText("Time announcements are running")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setSound(null)
            .build()
        
        startForeground(NOTIFICATION_ID, notification)
        Log.d(TAG, "✅ Foreground service started")
    }
    
    private fun stopForegroundService() {
        Log.d(TAG, "🛑 Stopping foreground service")
        cancelAllAlarms()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
    }
    
    private fun scheduleAnnouncements(scheduleJson: String) {
        try {
            Log.d(TAG, "📅 Scheduling announcements: $scheduleJson")
            
            val times = parseScheduleJson(scheduleJson)
            cancelAllAlarms()
            
            times.forEachIndexed { index, timeData ->
                scheduleAlarm(timeData, index)
            }
            
            Log.d(TAG, "✅ Scheduled ${times.size} announcements")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error scheduling announcements: ${e.message}")
            e.printStackTrace()
        }
    }
    
    private fun parseScheduleJson(json: String): List<TimeData> {
        val times = mutableListOf<TimeData>()
        
        try {
            val jsonObject = JSONObject(json)
            val timesArray = jsonObject.getJSONArray("times")
            
            for (i in 0 until timesArray.length()) {
                val timeObj = timesArray.getJSONObject(i)
                times.add(
                    TimeData(
                        hour = timeObj.getInt("hour"),
                        minute = timeObj.getInt("minute"),
                        message = timeObj.getString("message")
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error parsing schedule JSON: ${e.message}")
        }
        
        return times
    }
    
    private fun scheduleAlarm(timeData: TimeData, requestCode: Int) {
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, timeData.hour)
            set(Calendar.MINUTE, timeData.minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            
            // If time has passed today, schedule for tomorrow
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        
        val intent = Intent(this, TimeAnnouncementReceiver::class.java).apply {
            action = ACTION_ANNOUNCE_TIME
            putExtra("time_message", timeData.message)
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        scheduledAlarms.add(pendingIntent)
        
        // Schedule repeating daily alarm
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager?.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        } else {
            alarmManager?.setExact(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        }
        
        Log.d(TAG, "⏰ Scheduled alarm for ${timeData.hour}:${String.format("%02d", timeData.minute)} - ${timeData.message}")
    }
    
    private fun cancelAllAlarms() {
        Log.d(TAG, "🗑️ Cancelling all alarms")
        scheduledAlarms.forEach { pendingIntent ->
            alarmManager?.cancel(pendingIntent)
        }
        scheduledAlarms.clear()
    }
    
    private fun announceTime(message: String) {
        Log.d(TAG, "🔊 Announcing time: $message")
        
        if (tts != null) {
            val params = Bundle()
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "time_announcement")
            tts?.speak(message, TextToSpeech.QUEUE_FLUSH, params, "time_announcement")
        } else {
            Log.e(TAG, "❌ TTS not initialized")
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "💀 Service onDestroy")
        
        // Shutdown TTS
        tts?.stop()
        tts?.shutdown()
        
        cancelAllAlarms()
    }
    
    data class TimeData(
        val hour: Int,
        val minute: Int,
        val message: String
    )
}
