# Ponto Câmbio — Conversor de moedas

Conversor de moedas responsivo desenvolvido em React, TypeScript, Vite e Tailwind CSS. Permite conversões entre **BRL**, **USD** e **EUR** usando a API pública da fxratesapi.com.

## Funcionalidades

- Conversão entre BRL, USD e EUR;
- Cotação atualizada pela API `https://api.fxratesapi.com/latest?base=BRL`;
- Fallback de referência quando a API estiver indisponível;
- Formatação monetária em português do Brasil;
- Duas casas decimais no resultado;
- Inversão rápida das moedas;
- Histórico local das últimas conversões;
- Copiar resultado para a área de transferência;
- Layout responsivo para desktop e mobile.

## Requisitos

- Node.js 20 ou superior;
- pnpm 9 ou superior — ou npm, caso prefira adaptar os comandos.

## Instalação local

```bash
git clone https://github.com/SEU_USUARIO/conversor-moedas.git
cd conversor-moedas
pnpm install
pnpm dev
```

Depois, acesse o endereço exibido pelo Vite, normalmente `http://localhost:3000`.

## Scripts

```bash
pnpm dev      # inicia o servidor de desenvolvimento
pnpm check    # verifica o TypeScript
pnpm test     # executa todos os testes uma vez
pnpm test:watch # executa os testes em modo observação
pnpm build    # gera o build de produção
pnpm preview  # visualiza o build de produção
```

## Testes unitários

Os testes usam **Vitest**, **Testing Library** e **jsdom**. Eles podem ser executados antes de cada commit com:

```bash
pnpm test
```

### O que é coberto

- `client/src/lib/currency.test.ts`
  - conversão de vírgula e ponto decimal;
  - rejeição de valores vazios, negativos e não numéricos;
  - conversões BRL/USD/EUR e conversão inversa;
  - taxa `1` para moedas iguais;
  - precisão, arredondamento e duas casas decimais;
  - códigos e símbolos BRL, USD e EUR.
- `client/src/lib/rates-api.test.ts`
  - chamada para a URL correta com `base=BRL`;
  - leitura das taxas USD e EUR;
  - falhas HTTP;
  - resposta incompleta;
  - taxas zero ou negativas.
- `client/src/pages/Home.test.tsx`
  - carregamento das cotações e status de mercado conectado;
  - conversão pela interface e exibição do resultado;
  - inversão das moedas;
  - validação de valor inválido;
  - bloqueio de conversão para a mesma moeda;
  - fallback quando a API falha;
  - atalhos de conversão popular;
  - atualização manual das cotações.

As chamadas reais da API não são usadas nos testes. Elas são substituídas por respostas controladas, o que deixa os testes rápidos, reproduzíveis e sem dependência de internet. O teste `rates-api.test.ts` verifica o contrato esperado da integração.

### Adicionando os testes ao seu repositório

Os arquivos adicionados são:

```text
vitest.config.ts
client/src/test/setup.ts
client/src/lib/currency.test.ts
client/src/lib/rates-api.test.ts
client/src/pages/Home.test.tsx
client/src/lib/rates-api.ts
```

O módulo `client/src/lib/rates-api.ts` separa a chamada HTTP da tela, permitindo testar a integração com um `fetch` simulado e deixando o componente mais fácil de manter.

## Integração com a API

A aplicação faz uma requisição diretamente do navegador para:

```text
https://api.fxratesapi.com/latest?base=BRL
```

A resposta esperada contém as taxas `USD` e `EUR` no objeto `rates`. Como a aplicação é frontend-only e utiliza uma API pública, nenhuma chave secreta é necessária no código.

Se a API falhar, o arquivo `client/src/lib/currency.ts` fornece taxas de referência para que a interface continue funcionando. O status da aplicação informa quando o resultado está usando o fallback.

## Estrutura principal

```text
client/
  index.html
  src/
    App.tsx
    index.css
    lib/currency.ts
    pages/Home.tsx
package.json
vite.config.ts
tsconfig.json
README.md
```

## Publicação no GitHub

1. Crie um repositório vazio no GitHub, por exemplo `conversor-moedas`.
2. Na pasta do projeto, execute:

```bash
git init
git add .
git commit -m "feat: adiciona conversor de moedas BRL USD EUR"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/conversor-moedas.git
git push -u origin main
```

3. Para publicar gratuitamente, você pode usar Vercel, Netlify ou GitHub Pages. Para Vercel/Netlify, o comando de build é `pnpm build` e a pasta publicada é `dist/public`.

## Observações

- As taxas de câmbio são estimativas e podem variar.
- O resultado deve ser confirmado antes de qualquer operação financeira.
- O histórico é salvo apenas no `localStorage` do navegador do usuário.
