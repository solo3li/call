# Quickstart: Testing Delivery Filters

1. **Database Update:** Run the Entity Framework migrations after applying the code changes to add `IsExternalDelivery` to the `Order` table.
2. **Backend Execution:** Ensure the .NET Core backend is running (`cd project/backend/src/FoodRMS.Api && dotnet run`).
3. **Frontend Execution:** Ensure the HQ dashboard is running (`cd project/desktop/apps/hq && npm run dev`).
4. **Testing Filters:** 
   - Open the Delivery Dashboard in the HQ app.
   - You should see two new dropdowns for filtering: "Delivery Type" and "Delivery Company".
   - Select "Internal" and verify that only internal delivery orders show, and the company filter resets to "All" and grays out.
   - Select "External" and filter by "Unspecified" or a specific company name.
   - Check the new "Delivery Info" column on the order cards to confirm it matches the order's actual delivery routing.
