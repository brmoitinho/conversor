import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

const liveApiResponse = {
  rates: { BRL: 1, USD: 0.2, EUR: 0.16 },
  date: "2026-09-28T00:22:00.000Z",
};

function mockSuccessfulApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(liveApiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

beforeEach(() => {
  vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "test-conversion-id") });
  mockSuccessfulApi();
});

describe("Home — interface do conversor", () => {
  it("acessa a API e sinaliza que o mercado está conectado", async () => {
    render(<Home />);

    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      "https://api.fxratesapi.com/latest?base=BRL",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(screen.getByText(/Atualizado/)).toBeInTheDocument();
  });

  it("exibe a conversão com duas casas e moeda de destino", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());

    const amount = screen.getByLabelText("Você envia");
    await user.clear(amount);
    await user.type(amount, "100");
    const selects = container.querySelectorAll("select");
    await user.selectOptions(selects[0], "BRL");
    await user.selectOptions(selects[1], "USD");
    await user.click(screen.getByRole("button", { name: /converter agora/i }));

    expect(container.querySelector(".result-value")).toHaveTextContent(/20,00/);
    expect(container.querySelector(".rate-summary")).toHaveTextContent("1 BRL = 0,2000 USD");
    expect(screen.getByText("100 BRL")).toBeInTheDocument();
  });

  it("permite inverter as moedas", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Inverter moedas" }));

    const selects = container.querySelectorAll("select");
    expect(selects[0]).toHaveValue("USD");
    expect(selects[1]).toHaveValue("BRL");
    expect(screen.getByText("1 USD = 5,0000 BRL")).toBeInTheDocument();
  });

  it("mostra erro para valor inválido e não cria histórico", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());

    const amount = screen.getByLabelText("Você envia");
    await user.clear(amount);
    await user.type(amount, "-10");
    await user.click(screen.getByRole("button", { name: /converter agora/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("Digite um valor válido");
    expect(screen.getByText("Suas conversões aparecerão aqui.")).toBeInTheDocument();
  });

  it("impede conversão da mesma moeda", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());

    const selects = container.querySelectorAll("select");
    await user.selectOptions(selects[1], "BRL");
    await user.click(screen.getByRole("button", { name: /converter agora/i }));

    expect(screen.getByRole("alert")).toHaveTextContent("Escolha moedas diferentes");
  });

  it("usa fallback e informa a indisponibilidade da API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    render(<Home />);

    await waitFor(() => expect(screen.getByText("Modo referência")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("cotação ao vivo está indisponível");
    expect(screen.getByText("Taxa de referência")).toBeInTheDocument();
  });

  it("reage a um atalho de conversão popular", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    await waitFor(() => expect(screen.getByText("Mercado conectado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /USD.*EUR/i }));

    const selects = container.querySelectorAll("select");
    expect(selects[0]).toHaveValue("USD");
    expect(selects[1]).toHaveValue("EUR");
  });

  it("atualiza as taxas ao clicar no botão de refresh", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Atualizar cotações" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});
