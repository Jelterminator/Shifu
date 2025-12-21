import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Endpoint configuration for Microsoft Graph
import { authConfig } from '../config/authConfig';

export interface MicrosoftAuthResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}

class MicrosoftAuthService {
  private redirectUri: string;
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;

  constructor() {
    this.redirectUri = makeRedirectUri({
      scheme: 'shifu',
      path: 'auth',
    });
  }

  setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token;
    this.tokenExpiration = Date.now() + expiresIn * 1000;
  }

  getAccessToken(): string | null {
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }
    return null;
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiration = null;
    // Optional: Call Microsoft logout endpoint
    await Promise.resolve();
  }

  // Config for the useAuthRequest hook
  getAuthConfig(): object {
    return {
      clientId: authConfig.microsoft.clientId,
      scopes: authConfig.microsoft.scopes,
      redirectUri: this.redirectUri,
      responseType: ResponseType.Code,
    };
  }
}

export const microsoftAuthService = new MicrosoftAuthService();
