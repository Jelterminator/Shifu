import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { appointmentRepository } from '../db/repositories/AppointmentRepository';
import { useUserStore } from '../stores/userStore';

// Permission status value from expo-calendar
const PERMISSION_GRANTED = 'granted';

class DeviceCalendarSync {
  /**
   * Request calendar permissions from the user
   * @returns true if permission granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-console
      console.warn('Device calendar sync is not available on web');
      return false;
    }

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return status === PERMISSION_GRANTED;
  }

  /**
   * Check if calendar permissions are already granted
   */
  async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Calendar.getCalendarPermissionsAsync();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return status === PERMISSION_GRANTED;
  }

  /**
   * Sync device calendar events to the app's appointments
   * @param daysToSync Number of days in the future to sync (default: 30)
   */
  async sync(daysToSync: number = 30): Promise<number> {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-console
      console.warn('Device calendar sync is not available on web');
      return 0;
    }

    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Calendar permissions not granted');
    }

    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    if (calendars.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No device calendars found');
      return 0;
    }

    // Get user ID from store
    const userId = useUserStore.getState().user.id;
    if (!userId) {
      throw new Error('User ID not available');
    }

    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToSync);

    // Get events from all calendars
    const calendarIds = calendars.map(cal => cal.id);
    const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

    let syncedCount = 0;

    // Upsert events as appointments
    for (const event of events) {
      try {
        // Check if appointment already exists by external ID
        const existing = await appointmentRepository.getByExternalId(event.id);

        if (existing) {
          // Update existing appointment
          await appointmentRepository.update(existing.id, {
            name: event.title || 'Untitled Event',
            description: event.notes || undefined,
            startTime: new Date(event.startDate),
            endTime: new Date(event.endDate),
          });
        } else {
          // Create new appointment
          await appointmentRepository.create(userId, {
            name: event.title || 'Untitled Event',
            description: event.notes || undefined,
            startTime: new Date(event.startDate),
            endTime: new Date(event.endDate),
            externalId: event.id,
            source: 'device',
          });
        }
        syncedCount++;
      } catch {
        // Skip events that fail to sync
      }
    }

    return syncedCount;
  }

  /**
   * Delete all device-synced appointments
   */
  clearSyncedAppointments(): void {
    // This would require adding a method to AppointmentRepository
    // Currently a no-op placeholder
  }
}

export const deviceCalendarSync = new DeviceCalendarSync();
