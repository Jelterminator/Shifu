import * as Calendar from 'expo-calendar';
import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { useUserStore } from '../../stores/userStore';

class DeviceCalendarSync {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === Calendar.PermissionStatus.GRANTED;
  }

  async sync(daysToSync: number = 30): Promise<void> {
    const userId = useUserStore.getState().user.id;
    if (!userId) throw new Error('User not logged in');

    // 1. Permission Check
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== Calendar.PermissionStatus.GRANTED) {
      const granted = await this.requestPermissions();
      if (!granted) throw new Error('Calendar permission denied');
    }

    // 2. Fetch Calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarIds = calendars.map(c => c.id);

    if (calendarIds.length === 0) {
      // eslint-disable-next-line no-console
      console.warn('No device calendars found');
      return;
    }

    // 3. Fetch Events
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + daysToSync);

    const events = await Calendar.getEventsAsync(calendarIds, now, endDate);
    // eslint-disable-next-line no-console
    console.log(`Fetched ${events.length} events from device calendars`);

    // 4. Map & Upsert
    for (const event of events) {
      const startTime = new Date(event.startDate);
      const endTime = new Date(event.endDate);

      // Check existence
      const existing = await appointmentRepository.getByExternalId(event.id);

      if (existing) {
        // Update if changed
        if (
          existing.startTime.getTime() !== startTime.getTime() ||
          existing.endTime.getTime() !== endTime.getTime() ||
          existing.name !== event.title
        ) {
          await appointmentRepository.update(existing.id, {
            name: event.title,
            description: event.notes ?? undefined,
            startTime,
            endTime,
            // We keep source as 'device'
          });
        }
      } else {
        // Create
        await appointmentRepository.create(userId, {
          name: event.title,
          description: event.notes ?? undefined,
          startTime,
          endTime,
          externalId: event.id,
          source: 'device',
        });
      }
    }
  }
}

export const deviceCalendarSync = new DeviceCalendarSync();
