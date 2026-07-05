# Quickstart: advanced-driver-app

## Prerequisites
- Node.js (v18+)
- React Native CLI
- Mapbox Access Token
- Xcode (for iOS) / Android Studio (for Android)

## Setup

1. **Navigate to the driver app directory:**
   ```bash
   cd project/driver-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install
   ```

3. **Configure Environment:**
   Create a `.env` file in `project/driver-app/` and add your Mapbox token:
   ```
   MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
   API_BASE_URL=https://api.yourdomain.com
   ```

4. **Run the App:**
   - For iOS:
     ```bash
     npx react-native run-ios
     ```
   - For Android:
     ```bash
     npx react-native run-android
     ```

## Key Modules
- **Routing**: Handled by `src/services/MapboxService.ts`
- **Offline Sync**: Managed by `src/database/sync.ts` (using WatermelonDB)
- **Earnings UI**: Located in `src/screens/EarningsDashboard.tsx`
