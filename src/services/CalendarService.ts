import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { date?: string; dateTime?: string; timeZone?: string };
  end: { date?: string; dateTime?: string; timeZone?: string };
  location?: string;
  htmlLink?: string;
}

class CalendarService {
  async getEvents(
    timeMin: string = new Date().toISOString(),
    maxResults: number = 20
  ): Promise<CalendarEvent[]> {
    try {
      const tokens = await GoogleSignin.getTokens();
      const token = tokens.accessToken;

      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Calendar API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as { items?: CalendarEvent[] };
      return data.items || [];
    } catch (e: unknown) {
      const error = e as Error;
      // eslint-disable-next-line no-console
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}

export const calendarService = new CalendarService();
