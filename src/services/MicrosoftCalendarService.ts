export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  webLink?: string;
}

class MicrosoftCalendarService {
  async getEvents(
    accessToken: string,
    timeMin: string = new Date().toISOString(),
    top: number = 20
  ): Promise<MicrosoftCalendarEvent[]> {
    try {
      // Microsoft Graph API
      // Filter for events starting after timeMin
      const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${timeMin}&endDateTime=${new Date(new Date(timeMin).getFullYear() + 1, 0, 1).toISOString()}&$top=${top}&$orderby=start/dateTime`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'outlook.timezone="UTC"', // Standardize on UTC
        },
      });

      if (!response.ok) {
        throw new Error(`Microsoft Graph API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as { value?: MicrosoftCalendarEvent[] };
      return data.value || [];
    } catch (e: unknown) {
      const error = e as Error;
      // eslint-disable-next-line no-console
      console.error('Failed to fetch Microsoft calendar events:', error);
      return [];
    }
  }
}

export const microsoftCalendarService = new MicrosoftCalendarService();
