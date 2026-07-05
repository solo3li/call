# Quickstart: Trip Order Details

## Overview
This feature introduces an advanced Trip Orders dashboard for the driver application, allowing drivers to view detailed order information within a trip, see map locations, distinguish completed deliveries, and get an estimated time of arrival (ETA) for the trip completion.

## How to Test

1. **Start the Web App**:
   Navigate to `project/driver-app` and run:
   ```bash
   npm run web
   ```
   Or rebuild the docker image and deploy via Kubernetes as per the `foodRMS` deployment workflow.

2. **Navigate to the Trip Dashboard**:
   - The default screen (`App.tsx` or main routing screen) will now include a "Trip Overview" tab or section.
   - You should see a list of mocked orders (e.g., Order #1, Order #2) assigned to the current trip.

3. **Verify Functionality**:
   - **View Addresses**: Click on an individual order to expand or navigate to its specific delivery address.
   - **Map View**: Switch to the map view or look at the embedded map to see the plotted points for all orders.
   - **Completion Status**: Mark an order as delivered/completed. Verify that its visual status changes in the list and its map marker updates to a "Completed" state (e.g., green checkmark).
   - **ETA Calculation**: Observe the total estimated time for the trip. Upon marking an order as completed, the ETA should decrease to reflect the remaining distance.

## Key Files Modified
- `project/driver-app/App.tsx`: Main UI orchestration for the Trip dashboard.
- `project/driver-app/src/components/Map.tsx` (or similar): The map visualization component (using web-safe iframe or leaflet).
- `project/driver-app/src/store/TripStore.ts`: Zustand store managing the trip state, ETA calculation, and order statuses.
