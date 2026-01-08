package com.android.sayTime

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*

class TimeAnnouncementModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "TimeAnnouncementModule"
    
    override fun getName(): String {
        return "TimeAnnouncementModule"
    }
    
    @ReactMethod
    fun startService(scheduleJson: String, promise: Promise) {
        try {
            Log.d(TAG, "🚀 Starting service with schedule: $scheduleJson")
            
            val intent = Intent(reactApplicationContext, TimeAnnouncementService::class.java).apply {
                action = TimeAnnouncementService.ACTION_START_SERVICE
                putExtra(TimeAnnouncementService.EXTRA_SCHEDULE_DATA, scheduleJson)
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            
            promise.resolve("Service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error starting service: ${e.message}")
            promise.reject("START_SERVICE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            Log.d(TAG, "🛑 Stopping service")
            
            val intent = Intent(reactApplicationContext, TimeAnnouncementService::class.java).apply {
                action = TimeAnnouncementService.ACTION_STOP_SERVICE
            }
            
            reactApplicationContext.startService(intent)
            promise.resolve("Service stopped successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error stopping service: ${e.message}")
            promise.reject("STOP_SERVICE_ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun updateSchedule(scheduleJson: String, promise: Promise) {
        try {
            Log.d(TAG, "📅 Updating schedule: $scheduleJson")
            
            val intent = Intent(reactApplicationContext, TimeAnnouncementService::class.java).apply {
                action = TimeAnnouncementService.ACTION_START_SERVICE
                putExtra(TimeAnnouncementService.EXTRA_SCHEDULE_DATA, scheduleJson)
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            
            promise.resolve("Schedule updated successfully")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error updating schedule: ${e.message}")
            promise.reject("UPDATE_SCHEDULE_ERROR", e.message)
        }
    }
}
