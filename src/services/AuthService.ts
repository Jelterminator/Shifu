import {
  GoogleSignin,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: GoogleUser;
}

import { authConfig } from '../config/authConfig';

class AuthService {
  constructor() {
    this.configure();
  }

  private configure(): void {
    GoogleSignin.configure({
      scopes: authConfig.google.scopes,
      webClientId: authConfig.google.webClientId,
      iosClientId: authConfig.google.iosClientId,
    });
  }

  async signInWithGoogle(): Promise<AuthResult> {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      // v11+ returns { user: User, idToken: string, ... } directly as response in some versions,
      // or response.data in others.
      const raw = response as unknown as { user?: GoogleUser; data?: { user?: GoogleUser } };
      const user = (raw.user || raw.data?.user || raw) as GoogleUser;

      return { success: true, user };
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'Sign in cancelled' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Sign in already in progress' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Play services not available' };
      } else {
        console.error('Google Sign-In Error:', error);
        return { success: false, error: error.message || 'Unknown error' };
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  }

  async isSignedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const userInfo = await GoogleSignin.getCurrentUser();
      // @ts-expect-error - type mismatch workaround
      return userInfo ? (userInfo.user as GoogleUser) : null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
