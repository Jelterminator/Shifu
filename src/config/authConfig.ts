export const authConfig = {
  google: {
    webClientId: '1022062670949-9e302609fh59thkloboc3one055b32i9.apps.googleusercontent.com', // Required for Web & Android
    iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com', // Required for iOS
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  },
  microsoft: {
    clientId: '2692527e-8583-45c9-afc9-23d85d856912', // Azure App Registration Client ID
    scopes: ['user.read', 'Calendars.Read'],
    redirectUri: 'shifu://auth', // Ensure this matches your Azure setup (Mobile & Desktop -> Redirect URIs)
  },
};
