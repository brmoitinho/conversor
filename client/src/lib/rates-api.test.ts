import { describe, expect, it, vi } from "vitest";
import { fetchLiveRates, RATES_API_URL } from "./rates-api";

describe("fetchLiveRates", () => {
  it("consulta a API com BRL como moeda base e retorna USD/EUR", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          base: "BRL",
          date: "2026-09-28T00:22:00.000Z",
          rates: { BRL: 1, USD: 0.192696762, EUR: 0.169326329 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await fetchLiveRates(fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(RATES_API_URL, {
      headers: { Accept: "application/json" },
    });
    expect(result).toEqual({
      rates: { BRL: 1, USD: 0.192696762, EUR: 0.169326329 },
      date: "2026-09-28T00:22:00.000Z",
    });
  });

  it("rejeita resposta HTTP com erro", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("indisponível", { status: 503 }));

    await expect(fetchLiveRates(fetcher)).rejects.toThrow("HTTP 503");
  });

  it("rejeita resposta sem uma das moedas obrigatórias", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ rates: { USD: 0.19 } }), { status: 200 }),
    );

    await expect(fetchLiveRates(fetcher)).rejects.toThrow("todas as taxas suportadas");
  });

  it("rejeita taxa zero ou negativa", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ rates: { USD: 0, EUR: 0.17 } }), { status: 200 }),
    );

    await expect(fetchLiveRates(fetcher)).rejects.toThrow("todas as taxas suportadas");
  });
});
