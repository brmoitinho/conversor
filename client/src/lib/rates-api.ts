import { CURRENCY_CODES, type RateMap } from "./currency";

export const RATES_API_URL = "https://api.fxratesapi.com/latest?base=BRL";

type FxRatesApiResponse = {
  rates?: Record<string, number>;
  date?: string;
};

export type LiveRates = {
  rates: RateMap;
  date: string;
};

export async function fetchLiveRates(fetcher: typeof fetch = fetch): Promise<LiveRates> {
  const response = await fetcher(RATES_API_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`A API de câmbio retornou HTTP ${response.status}`);
  }

  const data = (await response.json()) as FxRatesApiResponse;
  const rates: RateMap = {
    BRL: 1,
    USD: Number(data.rates?.USD),
    EUR: Number(data.rates?.EUR),
  };

  const hasAllSupportedCurrencies = CURRENCY_CODES.every((code) => Number.isFinite(rates[code]) && rates[code] > 0);
  if (!hasAllSupportedCurrencies) {
    throw new Error("A resposta da API não contém todas as taxas suportadas");
  }

  return {
    rates,
    date: data.date ?? new Date().toISOString(),
  };
}
