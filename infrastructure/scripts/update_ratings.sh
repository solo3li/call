#!/bin/bash
SCHEMAS=$(kubectl exec postgres-0 -- psql -U postgres -d foodrms -t -c "SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%';")
for schema in $SCHEMAS; do
  echo "Updating schema $schema"
  kubectl exec postgres-0 -- psql -U postgres -d foodrms -c "UPDATE $schema.\"Orders\" SET \"Rating\" = floor(random() * 2 + 4) WHERE \"Rating\" IS NULL;" || echo "Failed to update $schema"
done
