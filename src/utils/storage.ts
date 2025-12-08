import { Platform } from 'react-native';
import type { StorageAdapter } from './storage.native';
import { storage as nativeStorage } from './storage.native';
import { storage as webStorage } from './storage.web';

// Choose the appropriate storage implementation based on platform
const storage: StorageAdapter = Platform.OS === 'web' ? webStorage : nativeStorage;

export { storage };
export type { StorageAdapter };
