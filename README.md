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
pnpm build    # gera o build de produção
pnpm preview  # visualiza o build de produção
```

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

## Publicação 

Para publicar gratuitamente, você pode usar Vercel, Netlify ou GitHub Pages. 

Para Vercel/Netlify, o comando de build é `pnpm build` e a pasta publicada é `dist/public`.

## Observações

- As taxas de câmbio são estimativas e podem variar.
- O resultado deve ser confirmado antes de qualquer operação financeira.
- O histórico é salvo apenas no `localStorage` do navegador do usuário.
