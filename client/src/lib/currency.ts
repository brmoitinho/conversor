export const CURRENCY_CODES = ["BRL", "USD", "EUR"] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];
export type RateMap = Record<CurrencyCode, number>;

export const CURRENCY_META: Record<CurrencyCode, { name: string; symbol: string }> = {
  BRL: { name: "Real brasileiro", symbol: "R$" },
  USD: { name: "Dólar americano", symbol: "US$" },
  EUR: { name: "Euro", symbol: "€" },
};

// Fallback de referência para manter o cálculo funcional em caso de indisponibilidade da API.
export const FALLBACK_RATES: RateMap = {
  BRL: 1,
  USD: 0.1835,
  EUR: 0.1653,
};

export function normalizeAmount(value: string): number | null {
  const trimmed = value.trim();
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getConversionRate(from: CurrencyCode, to: CurrencyCode, rates: RateMap): number {
  if (from === to) return 1;
  return rates[to] / rates[from];
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRate(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}
