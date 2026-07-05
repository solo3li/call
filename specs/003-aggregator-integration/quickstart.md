# Quickstart: Aggregator Integration

## Backend
1. Generate EF Core migration for the new `ExternalCompany` table and updates to the `Order` table.
2. Ensure migrations apply properly to the `template_tenant` schema and existing tenants.
3. Add the `ExternalCompanyController` with CRUD endpoints in `FoodRMS.Api`.
4. Update `OrderController` and `OrderService` to accept and validate the new external fields.

## Frontend (Desktop HQ App)
1. Add a new settings page for "External Companies" to allow CRUD operations.
2. Update the Call Center screen in the Desktop HQ App.
3. Add a dropdown/selector for the `ExternalCompany` when placing an order.
4. Add fields for `ExternalOrderId` and `CustomerPhone`.
5. Ensure these fields are sent properly to the `POST /api/orders` endpoint.
6. Verify receipt printing logic correctly prints the External Company name and Order ID.
