import { describe, expect, it } from "vitest";
import {
  FALLBACK_RATES,
  formatCurrency,
  formatRate,
  getConversionRate,
  normalizeAmount,
} from "./currency";

describe("normalizeAmount", () => {
  it("aceita valores com vírgula decimal", () => {
    expect(normalizeAmount("1.234,56")).toBe(1234.56);
  });

  it("aceita valores com ponto decimal", () => {
    expect(normalizeAmount("1234.56")).toBe(1234.56);
  });

  it.each(["", "   ", "abc", "-10", "10,20,30"])('rejeita entrada inválida "%s"', (value) => {
    expect(normalizeAmount(value)).toBeNull();
  });
});

describe("getConversionRate", () => {
  const rates = { BRL: 1, USD: 0.2, EUR: 0.16 } as const;

  it("retorna taxa 1 para a mesma moeda", () => {
    expect(getConversionRate("EUR", "EUR", rates)).toBe(1);
  });

  it("calcula BRL para USD usando a taxa relativa à base BRL", () => {
    expect(getConversionRate("BRL", "USD", rates)).toBeCloseTo(0.2, 10);
  });

  it("calcula USD para EUR sem inverter o par", () => {
    expect(getConversionRate("USD", "EUR", rates)).toBeCloseTo(0.8, 10);
  });

  it("mantém a reciprocidade aproximada entre pares", () => {
    const brlToUsd = getConversionRate("BRL", "USD", rates);
    const usdToBrl = getConversionRate("USD", "BRL", rates);
    expect(brlToUsd * usdToBrl).toBeCloseTo(1, 10);
  });
});

describe("formatação monetária", () => {
  it("exibe código/símbolo e duas casas decimais", () => {
    expect(formatCurrency(1234.5, "BRL")).toBe("R$ 1.234,50");
    expect(formatCurrency(99.9, "USD")).toBe("US$ 99,90");
    expect(formatCurrency(12, "EUR")).toBe("€ 12,00");
  });

  it("arredonda corretamente a apresentação da taxa", () => {
    expect(formatRate(0.192696762)).toBe("0,1927");
  });

  it("mantém as taxas de fallback dentro do conjunto suportado", () => {
    expect(FALLBACK_RATES).toEqual({ BRL: 1, USD: 0.1835, EUR: 0.1653 });
  });
});
