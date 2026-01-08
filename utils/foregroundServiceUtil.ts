import { NativeModules } from 'react-native';

const { TimeAnnouncementModule } = NativeModules;

export interface TimeSchedule {
  hour: number;
  minute: number;
  message: string;
}

export interface ScheduleData {
  times: TimeSchedule[];
}

/**
 * Start the foreground service with the given schedule
 * @param schedule - Array of time schedules
 * @returns Promise that resolves when service starts
 */
export const startForegroundService = async (schedule: TimeSchedule[]): Promise<string> => {
  const scheduleData: ScheduleData = { times: schedule };
  const scheduleJson = JSON.stringify(scheduleData);
  
  try {
    const result = await TimeAnnouncementModule.startService(scheduleJson);
    console.log('✅ Foreground service started:', result);
    return result;
  } catch (error) {
    console.error('❌ Error starting foreground service:', error);
    throw error;
  }
};

/**
 * Stop the foreground service
 * @returns Promise that resolves when service stops
 */
export const stopForegroundService = async (): Promise<string> => {
  try {
    const result = await TimeAnnouncementModule.stopService();
    console.log('✅ Foreground service stopped:', result);
    return result;
  } catch (error) {
    console.error('❌ Error stopping foreground service:', error);
    throw error;
  }
};

/**
 * Update the schedule for the foreground service
 * @param schedule - Array of time schedules
 * @returns Promise that resolves when schedule is updated
 */
export const updateServiceSchedule = async (schedule: TimeSchedule[]): Promise<string> => {
  const scheduleData: ScheduleData = { times: schedule };
  const scheduleJson = JSON.stringify(scheduleData);
  
  try {
    const result = await TimeAnnouncementModule.updateSchedule(scheduleJson);
    console.log('✅ Service schedule updated:', result);
    return result;
  } catch (error) {
    console.error('❌ Error updating service schedule:', error);
    throw error;
  }
};
