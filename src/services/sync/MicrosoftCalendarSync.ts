import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { useUserStore } from '../../stores/userStore';
import { microsoftAuthService } from '../MicrosoftAuthService';
import { microsoftCalendarService } from '../MicrosoftCalendarService';

class MicrosoftCalendarSync {
  async sync(_daysToSync: number = 30): Promise<void> {
    const userId = useUserStore.getState().user.id;
    if (!userId) throw new Error('User not logged in');

    const accessToken = microsoftAuthService.getAccessToken();
    if (!accessToken) {
      // eslint-disable-next-line no-console
      console.warn('Microsoft Sync: No access token available');
      return;
    }

    // 1. Fetch from Microsoft
    const now = new Date();
    const timeMin = now.toISOString();
    const events = await microsoftCalendarService.getEvents(accessToken, timeMin, 100);

    // eslint-disable-next-line no-console
    console.log(`Synced ${events.length} events from Microsoft`);

    // 2. Map & Upsert
    for (const event of events) {
      if (!event.start.dateTime || !event.end.dateTime) {
        continue;
      }

      const existing = await appointmentRepository.getByExternalId(event.id);

      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);

      if (existing) {
        // Update
        if (
          existing.startTime.getTime() !== startTime.getTime() ||
          existing.endTime.getTime() !== endTime.getTime() ||
          existing.name !== event.subject
        ) {
          await appointmentRepository.update(existing.id, {
            name: event.subject,
            description: event.bodyPreview,
            startTime,
            endTime,
          });
        }
      } else {
        // Create
        await appointmentRepository.create(userId, {
          name: event.subject,
          description: event.bodyPreview,
          startTime,
          endTime,
          externalId: event.id,
          source: 'microsoft',
        });
      }
    }
  }
}

export const microsoftCalendarSync = new MicrosoftCalendarSync();
