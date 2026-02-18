import { Platform } from 'react-native';

// Mock expo-calendar - must be before imports
jest.mock('expo-calendar', () => {
  const mockRequestCalendarPermissionsAsync = jest.fn();
  const mockGetCalendarPermissionsAsync = jest.fn();
  const mockGetCalendarsAsync = jest.fn();
  const mockGetEventsAsync = jest.fn();

  return {
    __esModule: true,
    requestCalendarPermissionsAsync: mockRequestCalendarPermissionsAsync,
    getCalendarPermissionsAsync: mockGetCalendarPermissionsAsync,
    getCalendarsAsync: mockGetCalendarsAsync,
    getEventsAsync: mockGetEventsAsync,
    EntityTypes: { EVENT: 'event' },
    // Expose mocks for test access
    __mocks: {
      requestCalendarPermissionsAsync: mockRequestCalendarPermissionsAsync,
      getCalendarPermissionsAsync: mockGetCalendarPermissionsAsync,
      getCalendarsAsync: mockGetCalendarsAsync,
      getEventsAsync: mockGetEventsAsync,
    },
  };
});

// Mock appointmentRepository
jest.mock('../../src/db/repositories/AppointmentRepository', () => ({
  appointmentRepository: {
    create: jest.fn(),
    getByExternalId: jest.fn(),
    update: jest.fn(),
    deleteBySource: jest.fn(),
  },
}));

// Mock userStore
jest.mock('../../src/stores/userStore', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      user: { id: 'test-user-id' },
    })),
  },
}));

// Import after mocks
import * as Calendar from 'expo-calendar';
import { appointmentRepository } from '../../src/db/repositories/AppointmentRepository';
import { deviceCalendarSync } from '../../src/services/sync/DeviceCalendarSync';

// Get mock references - use explicit interface to avoid 'possibly undefined' errors
interface CalendarMocks {
  requestCalendarPermissionsAsync: jest.Mock;
  getCalendarPermissionsAsync: jest.Mock;
  getCalendarsAsync: jest.Mock;
  getEventsAsync: jest.Mock;
}
const calendarMocks = (Calendar as unknown as { __mocks: CalendarMocks }).__mocks;

describe('DeviceCalendarSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to non-web platform
    (Platform.OS as string) = 'ios';
  });

  describe('requestPermissions', () => {
    it('should return false on web platform', async () => {
      (Platform.OS as string) = 'web';

      const result = await deviceCalendarSync.requestPermissions();

      expect(result).toBe(false);
    });

    it('should return true when permission is granted', async () => {
      calendarMocks.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await deviceCalendarSync.requestPermissions();

      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      calendarMocks.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await deviceCalendarSync.requestPermissions();

      expect(result).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should return false on web platform', async () => {
      (Platform.OS as string) = 'web';

      const result = await deviceCalendarSync.hasPermissions();

      expect(result).toBe(false);
    });

    it('should return true when permissions are granted', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await deviceCalendarSync.hasPermissions();

      expect(result).toBe(true);
    });
  });

  describe('sync', () => {
    it('should return 0 on web platform', async () => {
      (Platform.OS as string) = 'web';

      const result = await deviceCalendarSync.sync();

      expect(result).toBe(0);
    });

    it('should throw error if permissions not granted', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'denied' });

      await expect(deviceCalendarSync.sync()).rejects.toThrow('Calendar permissions not granted');
    });

    it('should return 0 if no calendars found', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
      calendarMocks.getCalendarsAsync.mockResolvedValue([]);

      const result = await deviceCalendarSync.sync();

      expect(result).toBe(0);
    });

    it('should create new appointments for new events', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
      calendarMocks.getCalendarsAsync.mockResolvedValue([{ id: 'cal-1' }]);
      calendarMocks.getEventsAsync.mockResolvedValue([
        {
          id: 'event-1',
          title: 'Test Event',
          notes: 'Test notes',
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
        },
      ]);
      (appointmentRepository.getByExternalId as jest.Mock).mockResolvedValue(null);
      (appointmentRepository.create as jest.Mock).mockResolvedValue({ id: 'apt-1' });

      const result = await deviceCalendarSync.sync();

      expect(result).toBe(1);
      expect(appointmentRepository.create).toHaveBeenCalledWith('test-user-id', {
        name: 'Test Event',
        description: 'Test notes',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        externalId: 'event-1',
        source: 'device',
      });
    });

    it('should update existing appointments', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
      calendarMocks.getCalendarsAsync.mockResolvedValue([{ id: 'cal-1' }]);
      calendarMocks.getEventsAsync.mockResolvedValue([
        {
          id: 'event-1',
          title: 'Updated Event',
          notes: null,
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
        },
      ]);
      (appointmentRepository.getByExternalId as jest.Mock).mockResolvedValue({
        id: 'existing-apt-1',
      });

      const result = await deviceCalendarSync.sync();

      expect(result).toBe(1);
      expect(appointmentRepository.update).toHaveBeenCalledWith('existing-apt-1', {
        name: 'Updated Event',
        description: undefined,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      });
      expect(appointmentRepository.create).not.toHaveBeenCalled();
    });

    it('should handle events without titles', async () => {
      calendarMocks.getCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
      calendarMocks.getCalendarsAsync.mockResolvedValue([{ id: 'cal-1' }]);
      calendarMocks.getEventsAsync.mockResolvedValue([
        {
          id: 'event-1',
          title: null,
          notes: null,
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
        },
      ]);
      (appointmentRepository.getByExternalId as jest.Mock).mockResolvedValue(null);
      (appointmentRepository.create as jest.Mock).mockResolvedValue({ id: 'apt-1' });

      await deviceCalendarSync.sync();

      expect(appointmentRepository.create).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          name: 'Untitled Event',
        })
      );
    });
  });

  describe('clearSyncedAppointments', () => {
    it('should be a no-op placeholder', () => {
      // Currently just a placeholder, should not throw
      expect(() => deviceCalendarSync.clearSyncedAppointments()).not.toThrow();
    });
  });
});
