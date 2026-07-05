#!/bin/bash
FILES=(
  "frontend/src/views/CustomersPage.tsx"
  "frontend/src/views/PublicMenuView.tsx"
  "frontend/src/views/AnalyticsPage.tsx"
  "frontend/src/views/CallCenterPage.tsx"
  "frontend/src/views/ManagementPages.tsx"
  "frontend/src/views/PosPage.tsx"
)

for file in "${FILES[@]}"; do
  # Remove the top-level const formatCurrency line
  sed -i '/const formatCurrency = (value: number) => `${value.toLocaleString("ar-SA")} ر.س`;/d' "$file"
  
  # Inject the import at the top (after other imports)
  sed -i '/import/!b;n;/import/!b;:a;n;/import/ba;i\import { useFormatCurrency } from "../utils/useFormatCurrency";' "$file"
  
  # Inject the hook inside the component
  # Assuming the main component is exported as function <Name>() {
  sed -i 's/export default function [a-zA-Z0-9_]*.*{/&\n  const formatCurrency = useFormatCurrency();/g' "$file"
  sed -i 's/export function [a-zA-Z0-9_]*.*{/&\n  const formatCurrency = useFormatCurrency();/g' "$file"
done
