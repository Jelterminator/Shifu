/**
 * Background services barrel export.
 *
 * ⚠️ IMPORTANT: Importing this module triggers `TaskManager.defineTask()`
 * in global scope (via BackgroundTaskSetup). This is intentional and
 * required by expo-task-manager.
 */

// Re-export everything consumers need
export {
  HEARTBEAT_TASK_NAME,
  getHeartbeatStatus,
  isHeartbeatRegistered,
  registerHeartbeatTask,
  triggerHeartbeatForTesting,
  unregisterHeartbeatTask,
} from './BackgroundTaskSetup';

export { HeartbeatService } from './HeartbeatService';
export type { HeartbeatResult } from './HeartbeatService';
