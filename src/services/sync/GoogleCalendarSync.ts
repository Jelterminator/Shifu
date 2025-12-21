import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { useUserStore } from '../../stores/userStore';
import { calendarService } from '../CalendarService';

class GoogleCalendarSync {
  async sync(_daysToSync: number = 30): Promise<void> {
    const userId = useUserStore.getState().user.id;
    if (!userId) throw new Error('User not logged in');

    // 1. Fetch from Google
    const now = new Date();
    const timeMin = now.toISOString();
    // Simple fetch of future events for now.
    // Ideally we fetch a specific window.
    const events = await calendarService.getEvents(timeMin, 100); // Max 100 for now

    // eslint-disable-next-line no-console
    console.log(`Synced ${events.length} events from Google`);

    // 2. Map & Upsert
    for (const event of events) {
      if (!event.start.dateTime || !event.end.dateTime) {
        // Skip full-day events for now (start.date only) or handle later
        continue;
      }

      const existing = await appointmentRepository.getByExternalId(event.id);

      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);

      if (existing) {
        // Update if needed
        if (
          existing.startTime.getTime() !== startTime.getTime() ||
          existing.endTime.getTime() !== endTime.getTime() ||
          existing.name !== event.summary
        ) {
          await appointmentRepository.update(existing.id, {
            name: event.summary,
            description: event.description,
            startTime,
            endTime,
          });
        }
      } else {
        // Create new
        await appointmentRepository.create(userId, {
          name: event.summary,
          description: event.description,
          startTime,
          endTime,
          externalId: event.id,
          source: 'google',
        });
      }
    }
  }
}

export const googleCalendarSync = new GoogleCalendarSync();
