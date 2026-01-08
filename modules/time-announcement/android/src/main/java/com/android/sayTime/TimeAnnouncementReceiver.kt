package com.android.sayTime

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class TimeAnnouncementReceiver : BroadcastReceiver() {
    
    private val TAG = "TimeAnnouncementReceiver"
    
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "📡 Received broadcast: ${intent.action}")
        
        when (intent.action) {
            TimeAnnouncementService.ACTION_ANNOUNCE_TIME -> {
                val timeMessage = intent.getStringExtra("time_message")
                Log.d(TAG, "⏰ Time to announce: $timeMessage")
                
                // Start service to announce time
                val serviceIntent = Intent(context, TimeAnnouncementService::class.java).apply {
                    action = TimeAnnouncementService.ACTION_ANNOUNCE_TIME
                    putExtra("time_message", timeMessage)
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d(TAG, "🔄 Device booted, restarting service")
                // Restart service after device reboot
                val serviceIntent = Intent(context, TimeAnnouncementService::class.java).apply {
                    action = TimeAnnouncementService.ACTION_START_SERVICE
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
