/**
 * BackgroundTaskSetup — Global task definition + registration for Shifu's Heartbeat.
 *
 * ⚠️ CRITICAL: `TaskManager.defineTask()` MUST be called in the **global scope**
 * of the JS bundle (not inside a React component or lifecycle method).
 *
 * This module:
 *   1. Defines the background task using `expo-task-manager`
 *   2. Exports helpers to register/unregister the task from React components
 *   3. Uses `expo-background-task` which hooks into:
 *      - Android: WorkManager (minimum 15-minute intervals)
 *      - iOS:     BGTaskScheduler (system-controlled scheduling)
 *
 * The system automatically ensures tasks run only when the device has sufficient
 * battery and network connectivity.
 */

import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { HeartbeatService } from './HeartbeatService';

// ── Task Identifier ─────────────────────────────────────────────────────
export const HEARTBEAT_TASK_NAME = 'shifu-heartbeat';

// ── Minimum interval between runs (in minutes) ─────────────────────────
// Android WorkManager enforces a 15-minute floor.
// iOS BGTaskScheduler treats this as advisory — the system decides the actual timing.
// Default: 60 minutes (1 hour). For nightly maintenance, a longer interval
// could be used, but we keep it moderate to stay responsive.
const HEARTBEAT_INTERVAL_MINUTES = 60;

// ── 1. GLOBAL TASK DEFINITION ───────────────────────────────────────────
// This MUST be called in the global scope. The callback runs when the OS
// wakes the app in the background.
TaskManager.defineTask(HEARTBEAT_TASK_NAME, async () => {
  try {
    console.log(`💓 [Heartbeat] Background task triggered at ${new Date().toISOString()}`);

    const heartbeat = HeartbeatService.getInstance();
    const result = await heartbeat.execute();

    if (result.success) {
      console.log(`💓 [Heartbeat] Completed successfully in ${result.durationMs}ms`);
      return BackgroundTask.BackgroundTaskResult.Success;
    } else {
      console.warn(`💔 [Heartbeat] Failed: ${result.error}`);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`💔 [Heartbeat] Uncaught error: ${message}`);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// ── 2. REGISTRATION HELPERS ─────────────────────────────────────────────
// These can be called from React components or during app initialization.

/**
 * Register the Heartbeat background task with the OS.
 * Safe to call multiple times — will skip if already registered.
 */
export async function registerHeartbeatTask(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('💓 [Heartbeat] Skipping registration on web');
    return false;
  }

  try {
    // Check if background tasks are available on this device
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      console.warn('💔 [Heartbeat] Background tasks are restricted on this device');
      return false;
    }

    // Check if already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(HEARTBEAT_TASK_NAME);
    if (isRegistered) {
      console.log('💓 [Heartbeat] Task already registered');
      return true;
    }

    // Register with the OS
    await BackgroundTask.registerTaskAsync(HEARTBEAT_TASK_NAME, {
      minimumInterval: HEARTBEAT_INTERVAL_MINUTES,
    });

    console.log(`💓 [Heartbeat] Task registered (interval: ${HEARTBEAT_INTERVAL_MINUTES} min)`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`💔 [Heartbeat] Registration failed: ${message}`);
    return false;
  }
}

/**
 * Unregister the Heartbeat background task.
 */
export async function unregisterHeartbeatTask(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(HEARTBEAT_TASK_NAME);
    if (isRegistered) {
      await BackgroundTask.unregisterTaskAsync(HEARTBEAT_TASK_NAME);
      console.log('💓 [Heartbeat] Task unregistered');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`💔 [Heartbeat] Unregistration failed: ${message}`);
  }
}

/**
 * Check if the heartbeat task is currently registered.
 */
export async function isHeartbeatRegistered(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    return await TaskManager.isTaskRegisteredAsync(HEARTBEAT_TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Get the current background task availability status.
 */
export async function getHeartbeatStatus(): Promise<BackgroundTask.BackgroundTaskStatus | null> {
  if (Platform.OS === 'web') return null;

  try {
    return await BackgroundTask.getStatusAsync();
  } catch {
    return null;
  }
}

/**
 * Trigger the background task immediately for testing (dev builds only).
 */
export async function triggerHeartbeatForTesting(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await BackgroundTask.triggerTaskWorkerForTestingAsync();
    console.log('💓 [Heartbeat] Test trigger sent');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`💔 [Heartbeat] Test trigger failed: ${message}`);
  }
}
