import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Copy,
  Globe2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  CURRENCY_META,
  CURRENCY_CODES,
  FALLBACK_RATES,
  formatCurrency,
  formatRate,
  getConversionRate,
  normalizeAmount,
  type CurrencyCode,
  type RateMap,
} from "@/lib/currency";

const API_URL = "https://api.fxratesapi.com/latest?base=BRL";
const HISTORY_KEY = "conversor-moedas-history";

type Conversion = {
  id: string;
  amount: number;
  from: CurrencyCode;
  to: CurrencyCode;
  result: number;
  rate: number;
  date: string;
};

const defaultAmount = "100";

function getSavedHistory(): Conversion[] {
  try {
    const saved = window.localStorage.getItem(HISTORY_KEY);
    return saved ? (JSON.parse(saved) as Conversion[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [amount, setAmount] = useState(defaultAmount);
  const [from, setFrom] = useState<CurrencyCode>("BRL");
  const [to, setTo] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<RateMap>(FALLBACK_RATES);
  const [sourceStatus, setSourceStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversion[]>(getSavedHistory);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parsedAmount = normalizeAmount(amount);
  const conversionRate = useMemo(() => getConversionRate(from, to, rates), [from, to, rates]);
  const convertedAmount = parsedAmount === null ? null : parsedAmount * conversionRate;
  const fromMeta = CURRENCY_META[from];
  const toMeta = CURRENCY_META[to];

  async function loadRates() {
    setIsRefreshing(true);
    setSourceStatus("loading");

    try {
      const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Falha ao consultar a API");
      const data = (await response.json()) as { rates?: Record<string, number>; date?: string };
      const nextRates: RateMap = {
        BRL: 1,
        USD: Number(data.rates?.USD),
        EUR: Number(data.rates?.EUR),
      };
      if (!Number.isFinite(nextRates.USD) || !Number.isFinite(nextRates.EUR)) {
        throw new Error("Resposta incompleta");
      }
      setRates(nextRates);
      setLastUpdated(data.date ?? new Date().toISOString());
      setSourceStatus("live");
      setError("");
    } catch {
      setRates(FALLBACK_RATES);
      setSourceStatus("fallback");
      setLastUpdated(null);
      setError("A cotação ao vivo está indisponível. Exibindo uma estimativa de referência.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadRates();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
  }, [history]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsedAmount === null || parsedAmount < 0) {
      setError("Digite um valor válido e maior ou igual a zero.");
      return;
    }
    if (from === to) {
      setError("Escolha moedas diferentes para fazer uma conversão.");
      return;
    }

    const item: Conversion = {
      id: crypto.randomUUID(),
      amount: parsedAmount,
      from,
      to,
      result: parsedAmount * conversionRate,
      rate: conversionRate,
      date: new Date().toISOString(),
    };
    setHistory((current) => [item, ...current.filter((entry) => entry.from !== from || entry.to !== to)].slice(0, 5));
    setError("");
  }

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
    setError("");
  }

  async function copyResult() {
    if (convertedAmount === null) return;
    await navigator.clipboard?.writeText(formatCurrency(convertedAmount, to));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const quickPairs: Array<[CurrencyCode, CurrencyCode]> = [
    ["BRL", "USD"],
    ["USD", "EUR"],
    ["EUR", "BRL"],
  ];

  return (
    <main className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="container app-container">
        <header className="topbar">
          <a className="brand" href="/" aria-label="Ponto Câmbio, início">
            <span className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></span>
            <span>PONTO<span className="brand-accent">.</span>CÂMBIO</span>
          </a>
          <div className="topbar-meta">
            <span className="status-pill"><span className={`status-dot ${sourceStatus}`} /> {sourceStatus === "live" ? "Mercado conectado" : sourceStatus === "loading" ? "Atualizando cotações" : "Modo referência"}</span>
            <span className="topbar-divider" />
            <span className="mini-label">BRL · USD · EUR</span>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> Câmbio sem complicação</div>
            <h1>Seu dinheiro,<br /><em>sem fronteiras.</em></h1>
            <p className="hero-description">Converta valores entre real, dólar e euro com clareza, agilidade e a cotação mais recente disponível.</p>
            <div className="trust-row">
              <span><ShieldCheck size={15} /> Cálculo seguro</span>
              <span><TrendingUp size={15} /> Taxas atualizadas</span>
            </div>
          </div>

          <form className="converter-card" onSubmit={handleSubmit}>
            <div className="card-header">
              <div>
                <p className="card-kicker">CONVERSOR</p>
                <h2>Quanto você quer converter?</h2>
              </div>
              <span className="live-badge"><span className={`status-dot ${sourceStatus}`} /> {sourceStatus === "live" ? "Ao vivo" : "Taxa base"}</span>
            </div>

            <div className="field-group">
              <label htmlFor="amount">Você envia</label>
              <div className="amount-field">
                <input
                  id="amount"
                  inputMode="decimal"
                  type="text"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  aria-describedby="amount-helper"
                  placeholder="0,00"
                />
                <CurrencySelect value={from} onChange={setFrom} />
              </div>
              <span className="field-helper" id="amount-helper">Digite o valor em {fromMeta.name.toLowerCase()}</span>
            </div>

            <div className="swap-row">
              <span className="swap-rule" />
              <button type="button" className="swap-button" onClick={swapCurrencies} aria-label="Inverter moedas" title="Inverter moedas">
                <ArrowDownUp size={17} />
              </button>
              <span className="swap-rule" />
            </div>

            <div className="field-group output-group">
              <label htmlFor="result">Você recebe</label>
              <div className="result-field" id="result" aria-live="polite">
                <span className="result-value">{convertedAmount === null ? "—" : formatCurrency(convertedAmount, to)}</span>
                <span className="result-code">{to}</span>
              </div>
              <span className="field-helper">Valor estimado em {toMeta.name.toLowerCase()}</span>
            </div>

            <div className="rate-summary">
              <span>1 {from} = {formatRate(conversionRate)} {to}</span>
              <span className="rate-source"><Clock3 size={13} /> {lastUpdated ? `Atualizado ${formatDate(lastUpdated)}` : "Taxa de referência"}</span>
            </div>

            {error && <div className="error-message" role="alert"><CircleAlert size={16} /> <span>{error}</span></div>}

            <button className="primary-button" type="submit">
              Converter agora <ArrowRight size={18} />
            </button>
            <p className="disclaimer">As taxas podem variar. Confirme o valor final antes de realizar uma operação.</p>
          </form>
        </section>

        <section className="details-grid">
          <div className="quick-section">
            <div className="section-heading">
              <div>
                <p className="section-kicker">ATALHOS</p>
                <h2>Conversões populares</h2>
              </div>
              <Globe2 size={20} />
            </div>
            <div className="quick-grid">
              {quickPairs.map(([pairFrom, pairTo]) => (
                <button className="quick-card" key={`${pairFrom}-${pairTo}`} type="button" onClick={() => { setFrom(pairFrom); setTo(pairTo); }}>
                  <span className="currency-avatar">{CURRENCY_META[pairFrom].symbol}</span>
                  <span className="quick-pair"><strong>{pairFrom}</strong><ArrowRight size={14} /><strong>{pairTo}</strong></span>
                  <span className="quick-rate">1 {pairFrom} = {formatRate(getConversionRate(pairFrom, pairTo, rates))} {pairTo}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="history-panel">
            <div className="section-heading history-heading">
              <div>
                <p className="section-kicker">SEU PAINEL</p>
                <h2>Conversões recentes</h2>
              </div>
              <button className="refresh-button" type="button" onClick={() => void loadRates()} disabled={isRefreshing} aria-label="Atualizar cotações" title="Atualizar cotações">
                <RefreshCw size={17} className={isRefreshing ? "spin" : ""} />
              </button>
            </div>
            {history.length > 0 ? (
              <div className="history-list">
                {history.map((item) => (
                  <button className="history-item" key={item.id} type="button" onClick={() => { setAmount(String(item.amount)); setFrom(item.from); setTo(item.to); }}>
                    <span className="history-icon">{CURRENCY_META[item.from].symbol}</span>
                    <span className="history-pair"><strong>{item.amount.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {item.from}</strong><small>{formatDate(item.date)}</small></span>
                    <span className="history-result">{formatCurrency(item.result, item.to)} <ArrowRight size={13} /></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-history"><Clock3 size={18} /><span>Suas conversões aparecerão aqui.</span></div>
            )}
          </aside>
        </section>

        <footer className="footer">
          <span>Dados de mercado via <a href="https://api.fxratesapi.com/" target="_blank" rel="noreferrer">fxratesapi.com</a></span>
          <button type="button" className="copy-button" onClick={() => void copyResult()} disabled={convertedAmount === null}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Resultado copiado" : "Copiar resultado"}
          </button>
        </footer>
      </div>
    </main>
  );
}

function CurrencySelect({ value, onChange }: { value: CurrencyCode; onChange: (value: CurrencyCode) => void }) {
  return (
    <div className="currency-select-wrap">
      <select value={value} onChange={(event) => onChange(event.target.value as CurrencyCode)} aria-label="Selecionar moeda">
        {CURRENCY_CODES.map((code) => <option value={code} key={code}>{code} — {CURRENCY_META[code].name}</option>)}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)).replace(" de ", " ");
}
