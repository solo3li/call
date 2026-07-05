import { useCurrency } from './useCurrency';

export function useFormatCurrency() {
  const { currencySymbol } = useCurrency();
  return (value: number) => `${value.toLocaleString("ar-SA")} ${currencySymbol}`;
}

