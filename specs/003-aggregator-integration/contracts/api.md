# API Contracts: Aggregator Integration

## Endpoints for `ExternalCompany`

### `GET /api/external-companies`
Fetch all external companies for the active tenant.
**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Talabat",
    "isActive": true
  }
]
```

### `POST /api/external-companies`
Create a new external company.
**Request**:
```json
{
  "name": "Talabat",
  "isActive": true
}
```

### `PUT /api/external-companies/{id}`
Update an existing external company (e.g., toggle active status).
**Request**:
```json
{
  "name": "Talabat",
  "isActive": false
}
```

## Order Endpoints Updates

### `POST /api/orders`
The request body for creating an order will be updated to accept external aggregator fields.
**Request Additions**:
```json
{
  // ... existing order fields
  "externalCompanyId": "uuid-optional",
  "externalOrderId": "string-optional",
  "customerPhone": "string-required-if-external"
}
```
