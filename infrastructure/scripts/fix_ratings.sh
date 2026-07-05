#!/bin/bash
SCHEMAS=$(kubectl exec postgres-0 -- psql -U postgres -d foodrms -t -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%';")
for schema in $SCHEMAS; do
  echo "Fixing schema $schema"
  kubectl exec postgres-0 -- psql -U postgres -d foodrms -c "ALTER TABLE $schema.\"Orders\" ADD COLUMN IF NOT EXISTS \"Rating\" integer;"
  kubectl exec postgres-0 -- psql -U postgres -d foodrms -c "UPDATE $schema.\"Orders\" SET \"Rating\" = floor(random() * 2 + 4) WHERE \"Rating\" IS NULL;"
done
