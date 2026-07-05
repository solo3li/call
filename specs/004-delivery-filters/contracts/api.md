# API Contracts

## `GET /api/Orders` and `GET /api/Orders/recent`
These existing endpoints will accept new query string parameters to support server-side filtering.

### New Query Parameters
- `deliveryType` (string, optional): 
  - Valid values: `"all"`, `"internal"`, `"external"`
  - Description: Filters orders based on whether they are handled by internal staff or external companies.
- `externalCompanyId` (string, optional):
  - Valid values: 
    - `"all"` (default if external is selected but no specific company)
    - `"unspecified"` (fetches external orders where `ExternalCompanyId` is null)
    - `[Guid]` (fetches orders assigned to a specific company)

### Response
The response format remains unchanged (`List<OrderResponse>`). The payload will now accurately reflect the filtered dataset.
