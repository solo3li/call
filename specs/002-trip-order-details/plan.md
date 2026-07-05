# Implementation Plan: Trip Order Details

**Branch**: `002-trip-order-details` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-trip-order-details/spec.md`

## Summary

Implement an advanced active trip view that displays all orders within the driver's current trip, including individual delivery addresses, map visualization of the route, distinction of completed vs pending orders, and a dynamically calculated ETA.

## Technical Context

**Language/Version**: React Native / TypeScript (Web via Expo)

**Primary Dependencies**: `expo`, `react-native-web`, `zustand` for state management. Map will be handled via Web-safe HTML embed to ensure compatibility with `npx expo export -p web`.

**Storage**: Local state (`zustand`) for the active trip progress in the current session.

**Testing**: Jest for utility logic (e.g., ETA calculation).

**Target Platform**: Web (running in a Kubernetes pod behind Nginx), accessed via browser.

**Project Type**: Mobile-first Web Application (Driver App).

**Performance Goals**: Instant updates when marking an order as completed; <500ms for map re-renders.

**Constraints**: MUST strictly use the existing Light theme/colors as dictated by the brand identity. No new color schemes or dark modes.

**Scale/Scope**: Typically 1 to 5 orders per trip.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clean and Organized Workspace**: Code will be cleanly separated into UI components (OrderList, MapView) and State (TripStore).
- **Design & Implementation Standard**: Will use the `impeccable` skill standard to deliver a high-quality UI while strictly adhering to the light-themed brand colors.
- **Strict Project Structure**: All code will be located exclusively within `project/driver-app/`.

## Project Structure

### Documentation (this feature)

```text
specs/002-trip-order-details/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code (repository root)

```text
project/
├── driver-app/
│   ├── App.tsx                        # Main entry and tab orchestration
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripOrderList.tsx      # List of orders in the trip
│   │   │   ├── TripOrderCard.tsx      # Individual order card with details
│   │   │   └── TripMapView.tsx        # HTML-based interactive map
│   │   ├── store/
│   │   │   └── useTripStore.ts        # Zustand store for trip state & ETA
│   │   └── utils/
│   │       └── routingHelpers.ts      # ETA calculation logic
```

**Structure Decision**: Standard React Native project layout within `project/driver-app/src`.
