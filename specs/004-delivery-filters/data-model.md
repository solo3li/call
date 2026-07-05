# Data Model: Delivery Filters

## Entities

### `Order` (Modified)
The `Order` entity will be extended with a new boolean property to explicitly distinguish external deliveries from internal ones, especially when an external company is not yet assigned.

**New Field:**
- `IsExternalDelivery` (boolean, default: `false`)

**Existing Relevant Fields:**
- `OrderType` (string): Usually `"Delivery"` for delivery orders.
- `ExternalCompanyId` (Guid, nullable): The assigned external company.

### `ExternalCompany` (Unchanged)
Existing entity representing third-party delivery companies (e.g., UberEats, Talabat).
- `Id` (Guid)
- `Name` (string)

## Validation Rules & Relationships
- If `IsExternalDelivery` is true, the order can optionally have an `ExternalCompanyId`.
- If `IsExternalDelivery` is false, it represents an internal delivery (if `OrderType` is `"Delivery"`).
- Migrations will be required to add the `IsExternalDelivery` column.
