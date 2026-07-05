# Data Model: Trip Order Details

## Entities

### `Trip`
Represents a delivery assignment given to a driver, containing multiple orders.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the trip |
| `status` | `enum` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `orders` | `Order[]` | List of orders assigned to this trip |
| `estimatedTimeMinutes` | `number` | Calculated estimated time remaining for the entire trip |

### `Order`
Represents an individual delivery task within a trip.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the order |
| `tripId` | `string` | Reference to the parent trip |
| `customerName` | `string` | Name of the customer receiving the order |
| `address` | `Address` | The exact delivery address |
| `status` | `enum` | `PENDING`, `PICKED_UP`, `COMPLETED`, `FAILED` |
| `coordinates` | `GeoPoint` | Latitude and longitude for mapping |

### `Address`
| Field | Type | Description |
|-------|------|-------------|
| `street` | `string` | Street name and number |
| `city` | `string` | City or region |
| `buildingDetails`| `string` | Apartment, floor, etc. |

### `GeoPoint`
| Field | Type | Description |
|-------|------|-------------|
| `latitude` | `number` | GPS Latitude |
| `longitude`| `number` | GPS Longitude |

## State Transitions
- **Order Status**: `PENDING` -> `PICKED_UP` -> `COMPLETED`.
- When all orders in a trip are `COMPLETED`, the Trip `status` transitions to `COMPLETED`.
- The `estimatedTimeMinutes` updates dynamically whenever an Order transitions to `COMPLETED`.
