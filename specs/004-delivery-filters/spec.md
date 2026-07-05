# Feature Specification: Delivery Filters

**Feature Branch**: `004-delivery-filters`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "فى شاشة عرض الطلبات فى hq, branch desktop ضيف فلتر التوصيل خارجى او داخلى و فلتر للشركة الخارجية باسمها او غير محدد و ضيف عمود فى جدول الطلبات عشان يحدد ده"

## Clarifications

### Session 2026-06-01

- Q: When 'Internal' delivery is selected in the 'Delivery Type' filter, what should happen to the 'Delivery Company' filter? → A: Keep it enabled but reset it to "All".
- Q: Are these filters applied on the frontend or backend? → A: Backend API (Server-side filtering).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filter by Delivery Type (Priority: P1)

As a dispatcher or manager, I want to filter the orders table by whether the delivery is internal or external, so that I can easily track who is responsible for the deliveries.

**Why this priority**: Essential for separating the dispatch workflows for internal staff versus external services.

**Independent Test**: Can be fully tested by selecting "Internal" or "External" in the delivery type filter and verifying that only matching orders are displayed in the table.

**Acceptance Scenarios**:

1. **Given** a list of mixed delivery orders, **When** the user selects "Internal" in the Delivery Type filter, **Then** only orders assigned to internal delivery are displayed.
2. **Given** a list of mixed delivery orders, **When** the user selects "External", **Then** only orders assigned to external delivery companies are displayed.

---

### User Story 2 - Filter by External Delivery Company (Priority: P1)

As a dispatcher, I want to filter external delivery orders by the specific company name or find orders where the company is unspecified, so that I can manage handoffs to specific third-party providers.

**Why this priority**: Crucial for tracking and managing third-party delivery services and finding orders that need to be assigned.

**Independent Test**: Can be tested by selecting a specific company in the Delivery Company filter and verifying the table updates correctly.

**Acceptance Scenarios**:

1. **Given** orders assigned to various external companies, **When** the user selects a specific company (e.g., "UberEats"), **Then** only orders for that company are displayed.
2. **Given** some unassigned external orders, **When** the user selects "Unspecified", **Then** only external orders without an assigned company are displayed.

---

### User Story 3 - View Delivery Info in Table (Priority: P2)

As a dispatcher, I want to see the delivery type and company name directly in the orders table column, so that I don't have to open each order to see how it's being delivered.

**Why this priority**: Improves at-a-glance visibility and reduces clicks.

**Independent Test**: Can be tested by looking at the orders table and verifying the new column displays the correct information for different order types.

**Acceptance Scenarios**:

1. **Given** an internal delivery order, **When** the user views the table, **Then** the "Delivery Info" column shows "Internal".
2. **Given** an external delivery order for "Talabat", **When** the user views the table, **Then** the "Delivery Info" column shows "External - Talabat".

### Edge Cases

- What happens when a delivery company is deleted but orders still reference it?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Delivery Type" filter on the orders dashboard (HQ and branch desktop apps) with options: All, Internal, External.
- **FR-002**: System MUST provide a "Delivery Company" filter with options: All, [List of Active Companies], Unspecified.
- **FR-003**: System MUST add a new column to the orders table that displays the delivery type and, if applicable, the delivery company name.
- **FR-004**: System MUST apply both filters simultaneously (AND logic) to the orders data query.
- **FR-005**: System MUST dynamically load or provide the list of available external delivery companies for the filter.
- **FR-006**: When "Internal" is selected in the "Delivery Type" filter, the "Delivery Company" filter MUST remain enabled but reset its value to "All".
- **FR-007**: Filtering MUST be implemented server-side via API query parameters to ensure accurate results across all paginated records.

### Key Entities 

- **Order**: Contains attributes indicating delivery type (Internal/External) and an optional external company identifier.
- **ExternalDeliveryCompany**: Contains attributes like ID and name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully filter orders by internal and external delivery types.
- **SC-002**: Users can successfully filter external delivery orders by specific companies or "unspecified".
- **SC-003**: The orders table visually indicates the delivery type and company for each order without requiring the user to navigate to a detail view.
- **SC-004**: Filtering operations execute and update the table in under 1 second.

## Assumptions

- There is an existing data structure distinguishing internal vs external deliveries.
- The external delivery companies are managed elsewhere in the system and can be queried to populate the filter dropdown.
