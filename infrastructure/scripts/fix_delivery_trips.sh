#!/bin/bash
schemas=$(kubectl exec -i postgres-0 -- psql -U postgres -d foodrms -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%' OR schema_name = 'template_tenant';" | tr -d '\r')

for schema in $schemas; do
  schema=$(echo "$schema" | xargs)
  if [ -n "$schema" ]; then
    echo "Fixing schema: $schema"
    kubectl exec -i postgres-0 -- psql -U postgres -d foodrms -c "
      ALTER TABLE IF EXISTS \"$schema\".\"Orders\" DROP CONSTRAINT IF EXISTS \"FK_Orders_DeliveryTrips_DeliveryTripId\";
      DROP TABLE IF EXISTS \"$schema\".\"DeliveryTrips\" CASCADE;
      ALTER TABLE \"$schema\".\"Orders\" DROP COLUMN IF EXISTS \"DeliveryTripId\";

      CREATE TABLE \"$schema\".\"DeliveryTrips\" (
          \"Id\" uuid NOT NULL,
          \"TripNumber\" text NOT NULL DEFAULT '',
          \"DriverName\" text NOT NULL DEFAULT '',
          \"DriverPhone\" text NOT NULL DEFAULT '',
          \"Status\" text NOT NULL DEFAULT 'Pending',
          \"CreatedAt\" timestamp with time zone NOT NULL,
          \"CompletedAt\" timestamp with time zone NULL,
          \"BranchId\" uuid NULL,
          \"TenantId\" uuid NOT NULL,
          CONSTRAINT \"PK_DeliveryTrips_$schema\" PRIMARY KEY (\"Id\"),
          CONSTRAINT \"FK_DeliveryTrips_Branches_BranchId\" FOREIGN KEY (\"BranchId\") REFERENCES \"$schema\".\"Branches\" (\"Id\"),
          CONSTRAINT \"FK_DeliveryTrips_Tenants_TenantId\" FOREIGN KEY (\"TenantId\") REFERENCES public.\"Tenants\" (\"Id\") ON DELETE CASCADE
      );

      ALTER TABLE \"$schema\".\"Orders\" ADD COLUMN \"DeliveryTripId\" uuid NULL;
      
      DO \$\$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'FK_Orders_DeliveryTrips_DeliveryTripId' 
              AND table_schema = '$schema'
          ) THEN
              ALTER TABLE \"$schema\".\"Orders\" 
              ADD CONSTRAINT \"FK_Orders_DeliveryTrips_DeliveryTripId\" 
              FOREIGN KEY (\"DeliveryTripId\") REFERENCES \"$schema\".\"DeliveryTrips\" (\"Id\") ON DELETE SET NULL;
          END IF;
      END
      \$\$;
    " < /dev/null
  fi
done
