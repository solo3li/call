# Data Model: Aggregator Integration

## Entities

### `ExternalCompany`
Represents an external food aggregator (e.g., Talabat, elmenus) that the call center can assign orders to.

**Fields**:
- `Id` (Guid, Primary Key)
- `Name` (String, Required) - Name of the aggregator.
- `IsActive` (Boolean, Default: true) - Whether this company is available in the UI.
- `CreatedAt` (DateTime)
- `UpdatedAt` (DateTime)

**Relationships**:
- One-to-Many with `Order` (An ExternalCompany can have many Orders).

### `Order` (Update to existing entity)
**New Fields**:
- `ExternalCompanyId` (Guid, Nullable) - Foreign key linking to an `ExternalCompany`. Null if it's a standard internal order.
- `ExternalOrderId` (String, Nullable) - The unique ID given by the aggregator's system.
- `CustomerPhone` (String, Nullable/Update) - Ensure this exists to satisfy FR-007.

## Validation Rules
- When `ExternalCompanyId` is provided on an order, `ExternalOrderId` MUST also be provided.
- `Name` of `ExternalCompany` must be unique per tenant to avoid duplicates.

## State Transitions
- `ExternalCompany` can be toggled between active (IsActive = true) and inactive (IsActive = false). Inactive companies cannot be used for new orders but remain for historical reporting.
