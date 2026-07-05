DO $$ 
DECLARE 
    tenant_id uuid := '550e8400-e29b-41d4-a716-446655440000';
    branch_id uuid := '550e8400-e29b-41d4-a716-4466554400b1';
    order_id uuid;
    customer_id uuid;
    i int;
    statuses text[] := ARRAY['Pending', 'Preparing', 'Completed'];
    types text[] := ARRAY['Delivery', 'Takeaway', 'DineIn'];
    rand_status text;
    rand_type text;
BEGIN
    FOR i IN 1..15 LOOP
        order_id := gen_random_uuid();
        customer_id := gen_random_uuid();
        rand_status := statuses[1 + (random() * 2)::int];
        rand_type := types[1 + (random() * 2)::int];

        INSERT INTO tenant_550e8400e29b41d4a716446655440000."Customers" (
            "Id", "Name", "PhoneNumber", "Addresses", "TenantId", "SavedFavorites", "CustomerPreferences"
        ) VALUES (
            customer_id, 'Ahmed Customer ' || i, '050' || lpad(i::text, 7, '1234'), '[]', tenant_id, '[]', '{}'
        );
        
        INSERT INTO tenant_550e8400e29b41d4a716446655440000."Orders" (
            "Id", "DailySequenceNumber", "OrderNumber", "CustomerName", "ItemsSummary", 
            "TotalAmount", "Status", "OrderType", "KitchenNotes", "IsRecurring", 
            "CreatedAt", "BranchId", "TenantId", "DeliveryCost", "CustomerId"
        ) VALUES (
            order_id, 
            i + 200, 
            'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((i + 200)::text, 4, '0'), 
            'Ahmed Customer ' || i, 
            '2x وجبات رئيسية 1, 1x مشروبات 1', 
            (random() * 200 + 50)::numeric(10,2), 
            rand_status, 
            rand_type, 
            CASE WHEN random() > 0.5 THEN 'بدون بصل لو سمحت' ELSE '' END, 
            false, 
            now() - (i || ' minutes')::interval, 
            branch_id, 
            tenant_id, 
            CASE WHEN rand_type = 'Delivery' THEN 15 ELSE 0 END,
            customer_id
        );

        INSERT INTO tenant_550e8400e29b41d4a716446655440000."OrderItems" (
            "OrderId", "MenuItemId", "Quantity", "Price", "TenantId"
        ) VALUES (
            order_id, 1, 2, 53, tenant_id
        ), (
            order_id, 11, 1, 82, tenant_id
        );
    END LOOP;
END $$;
