# Data Model: advanced-driver-app

## Entities

### `DeliveryRoute`
- **Fields**:
  - `id` (UUID): Unique identifier.
  - `orderId` (UUID): Reference to the assigned order.
  - `polyline` (String): Encoded route polyline from Mapbox.
  - `estimatedDuration` (Int): ETA in seconds.
  - `status` (Enum: `NAVIGATING`, `ARRIVED`, `DELIVERED`).
- **Relationships**: Belongs to `Order`, Belongs to `Driver`.
- **Validation**: `estimatedDuration` must be > 0.

### `DriverEarnings`
- **Fields**:
  - `id` (UUID): Unique identifier.
  - `driverId` (UUID): Reference to the driver.
  - `periodStart` (Timestamp): Start of the earning period.
  - `periodEnd` (Timestamp): End of the earning period.
  - `basePay` (Decimal): Base earning from deliveries.
  - `tips` (Decimal): Tips collected.
  - `bonuses` (Decimal): Promotional bonuses.
- **Relationships**: Belongs to `Driver`.

### `OfflineSyncAction`
- **Fields**:
  - `id` (UUID): Unique identifier.
  - `actionType` (String): Action to perform (e.g., `UPDATE_ORDER_STATUS`).
  - `payload` (JSON): The data associated with the action.
  - `timestamp` (Timestamp): When the action occurred locally.
  - `status` (Enum: `PENDING`, `SYNCED`, `FAILED`).
- **Relationships**: Belongs to `Driver`.
