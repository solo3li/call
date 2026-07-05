# Tasks: Trip Order Details

**Input**: Design documents from `specs/002-trip-order-details/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create component, store, and utils directories under `project/driver-app/src/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create `Trip`, `Order`, `Address`, and `GeoPoint` TypeScript interfaces in `project/driver-app/src/types/Trip.ts`
- [x] T003 Implement `useTripStore` in `project/driver-app/src/store/useTripStore.ts` with initial mock data

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Active Trip Details (Priority: P1) 🎯 MVP

**Goal**: As a driver, I can see all orders assigned to my current trip in detail.

**Independent Test**: Can be tested by assigning a multi-order trip to a driver and verifying that all orders appear in the list.

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `TripOrderList` component in `project/driver-app/src/components/TripOrderList.tsx`
- [x] T005 [US1] Integrate `TripOrderList` into `project/driver-app/App.tsx` (Trip Overview tab)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 - Map Visualization & Time Estimation (Priority: P1)

**Goal**: As a driver, I can see the entire trip route on a map and view the estimated time required.

**Independent Test**: View the map for a trip, verifying waypoints and the calculated ETA display.

### Implementation for User Story 3

- [x] T006 [P] [US3] Implement ETA calculation heuristic in `project/driver-app/src/utils/routingHelpers.ts`
- [x] T007 [P] [US3] Implement HTML iframe map in `project/driver-app/src/components/TripMapView.tsx`
- [x] T008 [US3] Connect `TripMapView` to `useTripStore` to dynamically plot `GeoPoint` markers
- [x] T009 [US3] Integrate `TripMapView` and ETA display into `project/driver-app/App.tsx`

**Checkpoint**: User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 2 - View Individual Order Address (Priority: P2)

**Goal**: As a driver, I can select any individual order within the trip to see its specific delivery address.

**Independent Test**: Tap an order from the list and verify its full delivery address is shown.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement `TripOrderCard` component in `project/driver-app/src/components/TripOrderCard.tsx`
- [x] T011 [US2] Update `TripOrderList.tsx` to utilize `TripOrderCard` for expanding address details

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T012 Verify all new UI components strictly use existing light brand colors and have no dark mode overrides
- [x] T013 Code cleanup and refactoring in `App.tsx`
- [x] T014 Execute quickstart.md validation to test the full flow locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 2 (P2)**: Depends on User Story 1 (requires the list to be present)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- US1 and US3 can be worked on in parallel by different developers
- `routingHelpers.ts` (T006) and `TripMapView.tsx` (T007) can be developed in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (Map/ETA) → Test independently → Deploy/Demo
4. Add User Story 2 (Address Details) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
