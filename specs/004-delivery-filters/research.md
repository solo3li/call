# Phase 0: Research & Decisions

## 1. Backend API Filtering for Pagination (Server-Side)
- **Decision**: Update `OrdersController.GetAllOrders` and `GetRecentOrders` to accept new query parameters: `string? deliveryType` and `string? externalCompanyId`.
- **Rationale**: The specification requires server-side filtering to ensure accurate pagination. By passing `deliveryType` ("internal", "external", "all") and `externalCompanyId` ("unspecified", specific Guid, or null for all), the backend can correctly filter the `IQueryable<Order>` before executing the query.
- **Alternatives**: Client-side filtering is insufficient for paginated data sets.

## 2. Distinguishing "Unspecified" External Delivery from Internal Delivery
- **Decision**: Add a boolean flag `IsExternalDelivery` to the `Order` entity, or rely on a specific `OrderType` value like `"ExternalDelivery"`. Since `OrderType` currently uses `"Delivery"`, it's safer to add a boolean `IsExternalDelivery` (default `false`) to explicitly mark an order as external even if `ExternalCompanyId` is null (unspecified).
- **Rationale**: If `ExternalCompanyId` is null, there is no way to know if an order is an internal delivery or an unassigned external delivery unless we add a flag.
- **Alternatives**: Changing `OrderType` from `"Delivery"` to `"InternalDelivery"` and `"ExternalDelivery"`, which could break existing hardcoded logic checking for `"Delivery"`. Adding `IsExternalDelivery` is a safer additive change.

## 3. Frontend Dashboard State & Fetching
- **Decision**: Update `DashboardContext` and `DeliveryDashboard.tsx` to handle the new filter states. We will pass the selected filter values to the `ordersApi.getAll` call.
- **Rationale**: The dashboard uses a context provider to fetch recent orders. We need to pass the filter parameters down to the API call. Since SignalR pushes new orders, we may also need to apply the filter on the client side for incoming real-time updates to maintain consistency.
- **Alternatives**: Fetching a new list completely every time a filter changes, which is standard but we must ensure SignalR pushes are also filtered locally before prepending to the list.
