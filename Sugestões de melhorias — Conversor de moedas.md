# Sugestões de melhorias — Conversor de moedas

**Projeto:** Ponto Câmbio  
**Escopo:** frontend React + TypeScript + Vite  
**Status atual:** 26 testes passando, TypeScript validado e integração com `fxratesapi.com` funcionando.

Este documento reúne melhorias recomendadas para evoluir o projeto com mais confiabilidade, segurança, acessibilidade, desempenho e facilidade de manutenção.

---

## 1. Prioridade alta

### 1.1 Mover a chamada da API para um backend ou proxy

Atualmente, o navegador acessa diretamente:

```text
https://api.fxratesapi.com/latest?base=BRL
```

Para uma primeira versão isso é aceitável, mas um backend ou proxy proporciona mais controle sobre:

- cache das taxas;
- limites de requisição;
- tratamento de indisponibilidade;
- observabilidade;
- eventual uso de chave de API sem expô-la ao navegador;
- proteção contra alterações inesperadas no contrato da API.

**Sugestão de implementação:** criar um endpoint interno, como `GET /api/rates?base=BRL`, que consulte a API externa e devolva apenas BRL, USD e EUR.

### 1.2 Adicionar timeout e AbortController

A função `fetchLiveRates` depende de uma resposta externa e atualmente pode aguardar indefinidamente em ambientes com rede instável.

**Melhoria sugerida:** cancelar a requisição depois de 8 a 10 segundos.

```ts
const controller = new AbortController();
const timeout = window.setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { Accept: "application/json" },
  });
  // processar resposta
} finally {
  window.clearTimeout(timeout);
}
```

Também é recomendável exibir uma mensagem específica para timeout e uma mensagem diferente para resposta inválida.

### 1.3 Não apresentar o fallback como se fosse uma cotação atual

O fallback é útil para manter a interface funcionando, porém pode induzir o usuário a acreditar que o valor é atual.

**Melhorias recomendadas:**

- exibir data da última atualização válida;
- mostrar um aviso mais destacado quando estiver em modo de referência;
- desabilitar a ação de conversão financeira real quando a taxa estiver desatualizada além de um limite definido;
- incluir a idade da cotação no estado visual.

Exemplo de mensagem:

> API indisponível. O resultado usa uma taxa de referência de 27/09/2026 e pode estar desatualizado.

### 1.4 Validar o contrato completo da API

A resposta é validada para garantir que as taxas existam e sejam positivas, mas a aplicação pode validar também:

- se `base` é realmente `BRL`;
- se `date` está em formato válido;
- se a resposta não contém valores absurdamente altos ou baixos;
- se os campos obrigatórios são números finitos;
- se a taxa possui precisão suficiente.

Para contratos maiores, considerar usar `zod` para validação explícita.

---

## 2. Precisão e valores monetários

### 2.1 Evitar dependência direta de ponto flutuante

O JavaScript usa ponto flutuante binário, então operações monetárias podem gerar pequenas diferenças, como `0.1 + 0.2` resultar em `0.30000000000000004` internamente.

A interface já formata o resultado com duas casas, mas uma evolução mais robusta deve definir uma estratégia explícita:

1. usar `decimal.js` ou biblioteca equivalente; ou
2. converter valores para uma unidade inteira mínima quando aplicável; ou
3. arredondar apenas em uma função central de domínio.

### 2.2 Centralizar a regra de arredondamento

Criar uma função específica para deixar a regra explícita e testável:

```ts
export function roundMoney(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
```

A função deve ter testes para casos de fronteira, incluindo valores próximos de `1,005`, `2,675` e números negativos, caso passem a ser aceitos.

### 2.3 Definir limites de entrada

Adicionar limites de negócio documentados, por exemplo:

- valor mínimo: `0,00` ou `0,01`;
- valor máximo por conversão;
- quantidade máxima de casas decimais na entrada;
- comportamento para valores muito grandes.

A regra deve ser aplicada no frontend e validada novamente em um backend caso a aplicação passe a persistir ou processar transações.

---

## 3. Arquitetura e manutenção

### 3.1 Extrair o estado do conversor para um hook

O componente `Home.tsx` concentra estado, efeitos, chamada de API, histórico, validação e apresentação visual.

Sugestão:

```text
client/src/
  hooks/useCurrencyConverter.ts
  hooks/useExchangeRates.ts
  lib/currency.ts
  lib/rates-api.ts
  pages/Home.tsx
```

Responsabilidades sugeridas:

- `useExchangeRates`: carregar, atualizar e expor o estado da API;
- `useCurrencyConverter`: calcular valores, trocar moedas e validar entradas;
- `Home.tsx`: apenas compor a interface.

Isso reduz a complexidade do componente e facilita testes isolados.

### 3.2 Separar componentes visuais

O componente da página pode ser dividido em componentes menores:

```text
components/currency/CurrencyField.tsx
components/currency/CurrencySelect.tsx
components/currency/RateSummary.tsx
components/currency/QuickPairs.tsx
components/currency/ConversionHistory.tsx
```

Benefícios:

- testes mais direcionados;
- componentes reutilizáveis;
- menor risco de regressão visual;
- manutenção mais simples.

### 3.3 Criar um tipo de estado explícito para as taxas

Em vez de controlar status e erro em estados independentes, considerar um modelo discriminado:

```ts
type RatesState =
  | { status: "loading"; rates: RateMap }
  | { status: "live"; rates: RateMap; updatedAt: string }
  | { status: "fallback"; rates: RateMap; error: string };
```

Isso evita combinações inválidas, como status `live` com data ausente ou status `fallback` sem informação de erro.

### 3.4 Criar constantes de configuração

Mover valores como URL, timeout, quantidade máxima do histórico e taxas fallback para um módulo de configuração:

```text
client/src/config/app.ts
```

Dessa forma, alterações de ambiente não exigem procurar strings espalhadas pelos componentes.

---

## 4. Testes

### 4.1 Adicionar cobertura de código

O projeto já possui testes unitários, de API e de interface. O próximo passo é medir cobertura:

```bash
pnpm add -D @vitest/coverage-v8
pnpm vitest run --coverage
```

Meta sugerida para a primeira etapa:

- linhas: mínimo de 80%;
- funções: mínimo de 80%;
- branches: mínimo de 75%;
- código crítico de cálculo e API: acima de 90%.

### 4.2 Adicionar testes de casos de fronteira

Incluir casos para:

- valor zero;
- valores com muitos decimais;
- valor máximo permitido;
- entrada com espaços;
- `1.000,50` e `1000.50`;
- resposta da API com `NaN`, `null`, string ou valores negativos;
- timeout da API;
- erro de parsing JSON;
- clique repetido no botão de atualização;
- falha do `localStorage`;
- ausência de `navigator.clipboard`.

### 4.3 Adicionar testes de acessibilidade automatizados

Instalar `jest-axe` e validar a página:

```bash
pnpm add -D jest-axe
```

Teste sugerido:

```tsx
const { container } = render(<Home />);
const results = await axe(container);
expect(results).toHaveNoViolations();
```

Além disso, executar testes manuais com teclado e leitor de tela.

### 4.4 Adicionar testes end-to-end

Os testes atuais validam componentes isoladamente. Para confirmar o comportamento em um navegador real, considerar Playwright ou Cypress:

- carregar a página;
- preencher valor;
- selecionar origem e destino;
- clicar em converter;
- confirmar resultado;
- simular API indisponível;
- validar comportamento mobile.

---

## 5. Interface e acessibilidade

### 5.1 Melhorar o seletor de moedas

Atualmente o seletor nativo funciona, mas pode evoluir para mostrar de forma mais clara:

- símbolo;
- código ISO;
- nome completo;
- busca em uma lista maior de moedas.

Exemplo visual:

```text
🇧🇷  BRL  Real brasileiro
🇺🇸  USD  Dólar americano
🇪🇺  EUR  Euro
```

### 5.2 Tornar as mensagens de estado mais acessíveis

Garantir que:

- o resultado use `aria-live="polite"`;
- erros tenham `role="alert"`;
- o campo inválido receba foco;
- o botão de atualizar informe estado de carregamento;
- textos não dependam apenas de cor;
- os elementos tenham contraste mínimo WCAG AA.

### 5.3 Melhorar a experiência de carregamento

Durante a atualização das taxas:

- mostrar um indicador visual no resultado;
- evitar que o usuário interprete o valor antigo como novo;
- manter a última taxa válida identificada;
- informar quando a operação terminar.

### 5.4 Tratar clipboard sem suporte

O recurso de copiar resultado deve lidar com navegadores que não oferecem `navigator.clipboard` ou que bloqueiam a permissão.

Sugestão:

- testar se a API existe;
- usar fallback com `textarea` temporário;
- exibir mensagem de erro amigável se a cópia falhar.

---

## 6. Desempenho

### 6.1 Cache das taxas

Evitar chamadas repetidas em cada abertura ou atualização rápida da tela. É possível armazenar:

```ts
type CachedRates = {
  rates: RateMap;
  fetchedAt: string;
};
```

Antes de chamar a API, verificar se o cache ainda está dentro do TTL, por exemplo, 15 minutos.

### 6.2 Debounce em atualizações manuais

O botão de atualização já possui estado de carregamento. Como proteção adicional, bloquear novas chamadas enquanto uma consulta estiver em andamento e limitar novas requisições por intervalo mínimo.

### 6.3 Reduzir dependências não utilizadas

Revisar o `package.json` e remover componentes e bibliotecas que não são usados pela aplicação final. Isso reduz:

- tamanho da instalação;
- tempo de build;
- superfície de manutenção;
- possibilidade de vulnerabilidades transitivas.

---

## 7. Segurança e privacidade

### 7.1 Sanitizar e limitar dados persistidos

O histórico usa `localStorage`. Recomendações:

- limitar quantidade e tamanho dos registros;
- validar o JSON ao ler;
- descartar itens inválidos;
- não armazenar informações pessoais;
- tratar `QuotaExceededError`.

### 7.2 Evitar confiança em valores vindos do cliente

Se o conversor evoluir para cotação contratual, pagamentos ou operações financeiras, o resultado não pode depender apenas do JavaScript do navegador. O servidor deverá:

- obter a taxa;
- validar o valor;
- calcular o resultado;
- registrar a taxa e o horário;
- aplicar autorização e auditoria.

### 7.3 Dependências e vulnerabilidades

Adicionar ao processo de CI:

```bash
pnpm audit
pnpm outdated
```

Também é recomendável usar Dependabot ou Renovate para atualizações controladas.

---

## 8. Integração contínua e qualidade

Criar um workflow no GitHub Actions em `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm test
      - run: pnpm build
```

Isso impede que alterações com testes quebrados ou TypeScript inválido sejam incorporadas à branch principal.

Também é recomendável adicionar:

- ESLint;
- Prettier em modo de verificação;
- commit hooks com Husky/lint-staged;
- revisão obrigatória via pull request.

---

## 9. Documentação e produto

### 9.1 Documentar limitações da cotação

O README deve explicar claramente:

- frequência de atualização;
- fonte das taxas;
- uso do fallback;
- diferença entre taxa indicativa e taxa comercial;
- ausência de garantia para operações financeiras;
- limitações da API pública.

### 9.2 Criar changelog

Adicionar `CHANGELOG.md` para registrar:

- novas moedas;
- mudanças na fonte de taxa;
- alterações de layout;
- correções de arredondamento;
- mudanças incompatíveis.

### 9.3 Preparar internacionalização

Se o projeto receber usuários de outros países, separar os textos da interface e permitir configuração de:

- idioma;
- localidade;
- separador decimal;
- formato de símbolo monetário;
- timezone da data da cotação.

---

## 10. Roadmap sugerido

### Próximo incremento

- [ ] Adicionar timeout com `AbortController`.
- [ ] Adicionar cache de 15 minutos.
- [ ] Adicionar cobertura de código.
- [ ] Adicionar casos de fronteira aos testes.
- [ ] Criar workflow básico do GitHub Actions.

### Incremento seguinte

- [ ] Extrair estado para hooks.
- [ ] Dividir `Home.tsx` em componentes menores.
- [ ] Adicionar testes end-to-end.
- [ ] Melhorar mensagens de API indisponível.
- [ ] Adicionar teste automatizado de acessibilidade.

### Evolução futura

- [ ] Backend/proxy para API externa.
- [ ] Mais moedas.
- [ ] Gráfico histórico.
- [ ] Preferências de idioma e localidade.
- [ ] Conta de usuário e histórico sincronizado, caso necessário.

---

## 11. Critérios de conclusão das melhorias

Uma melhoria pode ser considerada pronta quando:

1. possui objetivo e impacto documentados;
2. possui testes automatizados quando aplicável;
3. não introduz erros em `pnpm check`;
4. não quebra `pnpm test`;
5. não quebra `pnpm build`;
6. possui tratamento de erro e estado de carregamento;
7. mantém acessibilidade e responsividade;
8. está registrada no README ou no changelog quando alterar o comportamento público.
