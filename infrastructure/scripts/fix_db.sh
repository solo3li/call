#!/bin/bash
schemas=$(kubectl exec -i postgres-0 -- psql -U postgres -d foodrms -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%' OR schema_name = 'template_tenant';" | tr -d '\r')

for schema in $schemas; do
  schema=$(echo "$schema" | xargs)
  if [ -n "$schema" ]; then
    echo "Fixing schema: $schema"
    kubectl exec -i postgres-0 -- psql -U postgres -d foodrms -c "ALTER TABLE \"$schema\".\"AspNetUsers\" ADD COLUMN IF NOT EXISTS \"IsDelivery\" boolean NOT NULL DEFAULT FALSE;" < /dev/null
  fi
done
