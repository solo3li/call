import { useState, useEffect } from 'react';

export function useCurrency() {
  const [currencySymbol, setCurrencySymbol] = useState("ر.س");
  const [currencyCode, setCurrencyCode] = useState("SAR");

  useEffect(() => {
    const loadCurrency = () => {
      setCurrencySymbol(localStorage.getItem("currencySymbol") || "ر.س");
      setCurrencyCode(localStorage.getItem("currencyCode") || "SAR");
    };

    loadCurrency();

    window.addEventListener("storage", loadCurrency);
    return () => window.removeEventListener("storage", loadCurrency);
  }, []);

  return { currencySymbol, currencyCode };
}
