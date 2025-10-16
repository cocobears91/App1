# Ideas Client (Expo)

A mobile companion app for entrepreneurs to review and manage AI-analyzed idea batches. Built with Expo and React Native, the client reuses shared API types and provides an offline-aware experience for approving clusters, reviewing market research, and monitoring Notion sync status while on the go.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (copy `.env.example` to `.env` if you create one) to expose your backend API URL:
   ```bash
   export EXPO_PUBLIC_API_BASE_URL="https://your-backend.example.com"
   ```
3. Start the Expo development server:
   ```bash
   npm run start
   ```
4. Launch the Android client:
   ```bash
   npm run android
   ```

The app uses secure storage for authentication tokens and caches API responses with React Query + AsyncStorage so that the latest insights remain available offline.

## Key features

- **Authentication** – Email/password sign-in with Secure Store persistence.
- **Batch list** – Overview of analysis batches with completion progress.
- **Cluster management** – Approve/reject clusters, trigger re-analysis, and refresh processing states.
- **Idea detail** – Rich market research summaries with competitor insights and Notion sync status indicators.
- **Offline-first caching** – React Query persistence ensures previously viewed data is accessible without connectivity.
- **User-friendly feedback** – Dedicated loading, error, and offline banner states for mobile usage.

## Testing

Basic unit and component coverage is implemented with Jest and `@testing-library/react-native`.

```bash
npm run test
```

## Android build & signing

This project uses Expo's managed workflow. To produce a signed Android binary:

1. **Install the Expo CLI (optional but recommended):**
   ```bash
   npm install --global eas-cli
   ```
2. **Configure your app ID:** Update `app.json` with your `android.package` (e.g. `"com.company.ideaclient"`).
3. **Log into Expo:**
   ```bash
   eas login
   ```
4. **Configure build profile (if needed):**
   ```bash
   eas build:configure
   ```
5. **Create or upload a keystore:** During `eas build` you can let Expo manage credentials or provide your own. To generate one locally:
   ```bash
   keytool -genkeypair -v -keystore ideas-client.keystore -alias ideasClient -keyalg RSA -keysize 2048 -validity 10000
   ```
   Save the resulting `.keystore`, password, and key alias in a secure secret manager.
6. **Run the build:**
   ```bash
   eas build --platform android
   ```
7. **Download the artifact:** Once complete, Expo provides an `.apk` (for testing) or `.aab` (for Play Store submission).

For local device testing without EAS, you can also run:

```bash
expo run:android
```

This will create a local development build using the credentials configured in `android/`.

## Project structure

```
src/
  api/              // API client, shared types, and backend integrations
  components/       // Reusable UI components (loading, error, status badges)
  hooks/            // Connectivity and other shared hooks
  navigation/       // Stack navigator definitions
  providers/        // App-level providers (auth & React Query)
  screens/          // Authentication, batch list, cluster overview, idea details
  utils/            // Formatting helpers
  test/             // Jest unit/component tests
```

## Environment notes

- `EXPO_PUBLIC_API_BASE_URL` controls the backend base URL. Because it is prefixed with `EXPO_PUBLIC_`, Expo exposes it to the client bundle.
- All protected API calls automatically include the bearer token returned from `/auth/login`.
- Mutations optimistically update the React Query cache so UI state stays responsive after approve/reject actions.

## Offline considerations

- Network reachability is monitored with `expo-network` to toggle offline banners and avoid sending write operations while offline.
- Query data persists to AsyncStorage, enabling previously fetched batches, clusters, and idea details to remain available without a connection.
