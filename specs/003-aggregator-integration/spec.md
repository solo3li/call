# Feature Specification: Aggregator Integration

**Feature Branch**: `003-aggregator-integration`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "عاوز اضف سيستم للشركات الخارجية بمعنى بيكون فى الكول سنتر مكنة طلبات بتلقى اوردرات و بطلع ريسيت و اكيد يعنى اوردر زى ده بيضرب على سيستم و الشركة الخارجية بتكون طلبات او مثلا لو اوردر من منيوز بيضرب بردو كدا على السيستم و بيكون منيوز عاوز الادارة فى تطبيق desktop hq يخصص الشركات الخارجية اللى محتاجة و يخصص هو كل حاجة بمزاجه و اوردرات الشركات الخارجيه بتضرب فقط من شاشة الكول سنتر فى hq"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure External Companies (Priority: P1)

HQ Administrators need to manage (add, edit, toggle) external aggregator companies (like Talabat, elmenus) in the HQ Desktop App, so that the call center has a predefined list of valid companies to assign orders to.

**Why this priority**: Without configuring the companies, the call center cannot assign an order to an external company.

**Independent Test**: Can be tested independently by logging into HQ admin panel and verifying that an external company can be created and listed.

**Acceptance Scenarios**:

1. **Given** an HQ Admin is logged in, **When** they navigate to "External Companies" management, **Then** they can add a new company with its specific configurations.
2. **Given** an existing external company, **When** the admin disables it, **Then** it no longer appears as an option for the call center.

---

### User Story 2 - Enter External Order in Call Center (Priority: P1)

Call center agents need to enter orders originating from external companies (Talabat, elmenus, etc.) directly from the Call Center screen in the HQ Desktop App, so that these orders are recorded in the central system.

**Why this priority**: Core functionality; orders from external machines must be punched into the system.

**Independent Test**: Can be tested independently by creating a mock order, selecting an external company, and verifying it saves to the database.

**Acceptance Scenarios**:

1. **Given** a call center agent is creating an order, **When** they select an external company (e.g., Talabat), **Then** the order is marked as an external order linked to that company.
2. **Given** the call center screen, **When** the agent submits an external order, **Then** a receipt is automatically printed indicating the external company.

### Edge Cases

- What happens if an external company is disabled while an order is being punched?
- Can external orders be modified or cancelled once entered, and does that process differ from normal orders?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow HQ Administrators to create, read, update, and disable External Companies in the Desktop HQ App.
- **FR-002**: System MUST allow Call Center Agents to select an active External Company when punching an order in the Desktop HQ App.
- **FR-003**: System MUST record the selected External Company alongside the order details in the central database.
- **FR-004**: System MUST trigger a receipt print automatically when an external order is successfully punched in.
- **FR-005**: System MUST NOT allow external orders to be entered from applications other than the HQ Call Center screen.
- **FR-006**: System MUST handle custom pricing models per aggregator, allowing each External Company to have a customized price list for menu items.
- **FR-007**: System MUST track the external order ID and customer details, requiring the call center agent to manually enter both the aggregator's specific order ID and the customer's phone number.

### Key Entities

- **ExternalCompany**: Represents an aggregator (Talabat, elmenus). Attributes: Id, Name, IsActive.
- **Order**: Will be updated to include an optional reference to an `ExternalCompanyId` and potentially an `ExternalOrderId`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: HQ Admins can configure a new external company in under 1 minute.
- **SC-002**: Call center agents can successfully punch an external order and print a receipt in under 30 seconds.
- **SC-003**: 100% of external orders accurately reflect their source company in reporting and receipts.

## Assumptions

- External orders are entered manually by call center agents reading from the aggregator's machine (no automatic API integration with Talabat/elmenus).
- Menu items and prices for external companies are the same as regular dine-in/takeaway unless otherwise specified.
- The Call Center screen already exists in the `desktop hq` app and will be extended.
