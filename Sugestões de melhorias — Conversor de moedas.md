# Sugestões de melhorias — Conversor de moedas

**Status atual:** 26 testes, TypeScript validado e integração com `fxratesapi.com` funcionando.

Este documento reúne melhorias recomendadas para evoluir o projeto com mais confiabilidade, segurança, acessibilidade, desempenho e facilidade de manutenção.

# 1 Validar o contrato completo da API

A resposta é validada para garantir que as taxas existam e sejam positivas, mas a aplicação pode validar também:

- se `base` é realmente `BRL`;

- se `date` está em formato válido;

- se a resposta não contém valores absurdamente altos ou baixos;

- se os campos obrigatórios são números finitos;

- se a taxa possui precisão suficiente.

# 2. Precisão e valores monetários

## 2.1 Evitar dependência direta de ponto flutuante

O JavaScript usa ponto flutuante binário, então operações monetárias podem gerar pequenas diferenças, como `0.1 + 0.2` resultar em `0.30000000000000004` internamente.

A interface já formata o resultado com duas casas, mas uma evolução mais robusta deve definir uma estratégia explícita:

1. usar `decimal.js` ou biblioteca equivalente; ou
  
2. converter valores para uma unidade inteira mínima quando aplicável; ou

3. arredondar apenas em uma função central de domínio.

## 2.2 Centralizar a regra de arredondamento

Criar uma função específica para deixar a regra explícita e testável:

```ts
export function roundMoney(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
```

A função deve ter testes para casos de fronteira, incluindo valores próximos de `1,005`, `2,675` e números negativos, caso passem a ser aceitos.

# 3. Interface e acessibilidade

## 3.1 Melhorar o seletor de moedas

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

## 3.2 Tornar as mensagens de estado mais acessíveis

Garantir que:

- o resultado use `aria-live="polite"`;

- erros tenham `role="alert"`;

- o campo inválido receba foco;

- o botão de atualizar informe estado de carregamento;

- textos não dependam apenas de cor;

- os elementos tenham contraste mínimo WCAG AA.

## 3.3 Melhorar a experiência de carregamento

Durante a atualização das taxas:

- mostrar um indicador visual no resultado;

- evitar que o usuário interprete o valor antigo como novo;

- manter a última taxa válida identificada;

- informar quando a operação terminar.

## 3.4 Tratar clipboard sem suporte

O recurso de copiar resultado deve lidar com navegadores que não oferecem `navigator.clipboard` ou que bloqueiam a permissão.

Sugestão:

- testar se a API existe;

- usar fallback com `textarea` temporário;

- exibir mensagem de erro amigável se a cópia falhar.

# 4. Documentação e produto

## 4.1 Documentar limitações da cotação

O README deve explicar claramente:

- frequência de atualização;

- fonte das taxas;

- uso do fallback;

- diferença entre taxa indicativa e taxa comercial;

- ausência de garantia para operações financeiras;

- limitações da API pública.

## 4.2 Criar changelog

Adicionar `CHANGELOG.md` para registrar:

- novas moedas;

- mudanças na fonte de taxa;

- alterações de layout;

- correções de arredondamento;

- mudanças incompatíveis.

## 4.3 Preparar internacionalização

Se o projeto receber usuários de outros países, separar os textos da interface e permitir configuração de:

- idioma;

- localidade;

- separador decimal;

- formato de símbolo monetário;

- timezone da data da cotação.
