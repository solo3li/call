#!/bin/bash
file="frontend/src/components/OrdersTable.tsx"
sed -i '1i import { useCurrency } from "../utils/useCurrency";' "$file"
sed -i 's/export function OrdersTable.*{/&\n  const { currencySymbol } = useCurrency();/g' "$file"
sed -i 's/{order.totalAmount} ر.س/{order.totalAmount} {currencySymbol}/g' "$file"

file="frontend/src/components/TopItems.tsx"
sed -i '1i import { useCurrency } from "../utils/useCurrency";' "$file"
sed -i 's/export function TopItems.*{/&\n  const { currencySymbol } = useCurrency();/g' "$file"
sed -i 's/{item.revenue.toLocaleString()} ر.س/{item.revenue.toLocaleString()} {currencySymbol}/g' "$file"

file="frontend/src/components/StatsCards.tsx"
sed -i '1i import { useCurrency } from "../utils/useCurrency";' "$file"
sed -i 's/export function StatsCards.*{/&\n  const { currencySymbol } = useCurrency();/g' "$file"
sed -i 's/unit: "ر.س"/unit: currencySymbol/g' "$file"
