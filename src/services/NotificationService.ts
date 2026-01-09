import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
const CATEGORY_PLAN_REMINDER = 'PLAN_REMINDER';
const CATEGORY_ANCHOR_REMINDER = 'ANCHOR_REMINDER';
const ACTION_DONE = 'DONE';
const ACTION_SKIP = 'SKIP';
const ACTION_OK = 'OK';

export class NotificationService {
  constructor() {
    this.configure();
  }

  private configure(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () =>
        Promise.resolve({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
    });

    if (Platform.OS !== 'web') {
      void this.registerCategories();
    }
  }

  private async registerCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync(CATEGORY_PLAN_REMINDER, [
      {
        identifier: ACTION_DONE,
        buttonTitle: 'Done',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: ACTION_SKIP,
        buttonTitle: 'Skip',
        options: {
          isDestructive: true,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(CATEGORY_ANCHOR_REMINDER, [
      {
        identifier: ACTION_OK,
        buttonTitle: 'OK',
        options: {
          isDestructive: false,
        },
      },
    ]);
  }

  // ... (requestPermissions stays same) ...

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === Notifications.PermissionStatus.GRANTED;
  }

  // ... (schedulePlanReminder stays largely same, maybe refactor common logic if desired, but I will just append) ...

  async schedulePlanReminder(plan: { id: string; title: string; startTime: Date }): Promise<void> {
    if (Platform.OS === 'web') return;

    const triggerDate = new Date(plan.startTime.getTime() - 5 * 60000); // 5 mins before
    const now = new Date();

    if (triggerDate.getTime() < now.getTime()) {
      if (plan.startTime.getTime() > now.getTime()) {
        const secondsFromNow = 5;
        await this.scheduleNotification(
          plan.id,
          plan.title,
          "It's time for:",
          CATEGORY_PLAN_REMINDER,
          secondsFromNow
        );
        return;
      }
      return;
    }

    const secondsFromNow = (triggerDate.getTime() - now.getTime()) / 1000;

    await this.scheduleNotification(
      plan.id,
      plan.title,
      "It's time for:",
      CATEGORY_PLAN_REMINDER,
      secondsFromNow
    );
  }

  async scheduleAnchorReminder(anchor: {
    id: string;
    title: string;
    startTime: Date;
  }): Promise<void> {
    if (Platform.OS === 'web') return;

    const triggerDate = new Date(anchor.startTime.getTime() - 5 * 60000); // 5 mins before
    const now = new Date();

    if (triggerDate.getTime() < now.getTime()) {
      if (anchor.startTime.getTime() > now.getTime()) {
        const secondsFromNow = 5;
        await this.scheduleNotification(
          anchor.id,
          anchor.title,
          'Upcoming Anchor:',
          CATEGORY_ANCHOR_REMINDER,
          secondsFromNow
        );
        return;
      }
      return;
    }

    const secondsFromNow = (triggerDate.getTime() - now.getTime()) / 1000;

    await this.scheduleNotification(
      anchor.id,
      anchor.title,
      'Upcoming Anchor:',
      CATEGORY_ANCHOR_REMINDER,
      secondsFromNow
    );
  }

  private async scheduleNotification(
    id: string,
    title: string,
    prefix: string,
    category: string,
    seconds: number
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Shifu',
        body: `${prefix} ${title}`,
        data: { id },
        categoryIdentifier: category,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
        repeats: false,
      },
      identifier: id,
    });
  }

  async cancelPlanReminder(planId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(planId);
  }

  async cancelNotification(id: string): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  /**
   * Syncs anchor notifications:
   * 1. Schedules notifications for all FUTURE anchors provided.
   * 2. Cancels notifications for any existing anchor notifications that are NOT in the provided list.
   *    (Assumes anchor IDs start with 'practice-')
   */
  async syncAnchorNotifications(
    anchors: { id: string; title: string; startTime: Date }[]
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    // 1. Schedule provided anchors
    const now = new Date();
    const futureAnchors = anchors.filter(a => a.startTime > now);
    const futureAnchorIds = new Set(futureAnchors.map(a => a.id));

    for (const anchor of futureAnchors) {
      await this.scheduleAnchorReminder(anchor);
    }

    // 2. Cleanup old/removed anchor notifications
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      for (const notif of scheduled) {
        const id = notif.identifier;
        if (id.startsWith('practice-') && !futureAnchorIds.has(id)) {
          // It's an anchor notification, but not in our current valid future list -> delete it
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (e) {
      console.warn('Failed to sync anchor cleanup', e);
    }
  }
}

export const notificationService = new NotificationService();
