# Documentação Técnica: Conversor de Moedas (Agile Docs & Code)

## 1. Descrição da Funcionalidade
O módulo de conversão de moedas permite converter montantes entre diferentes moedas (USD, EUR, BRL) utilizando taxas de câmbio pré-definidas. O sistema valida entradas de dados e garante uma precisão de, no mínimo, duas casas decimais com arredondamento correto.

## 2. Critérios de Aceitação
- Permitir a seleção da moeda de origem e da moeda de destino.
- Permitir a inserção do valor/quantidade na moeda de origem.
- Exibir o valor equivalente na moeda de destino.
- Resultados com precisão de no mínimo 2 casas decimais e arredondamento adequado.
- Tratar erros para entradas inválidas (valores negativos, moedas não suportadas, tipos de dados incorretos).

## 3. Diagrama de Fluxo
[Início]
│
▼
[Inserir Valor e Selecionar Moedas (Origem/Destino)]
│
▼
[Validar Entradas] ──(Inválido)──► [Exibir Mensagem de Erro] ──► [Fim]
│
(Válido)
│
▼
[Obter Taxa de Câmbio (Dicionário/API)]
│
▼
[Calcular: Valor * (Taxa Destino / Taxa Origem)]
│
▼
[Arredondar para 2 Casas Decimais]
│
▼
[Exibir Resultado ao Utilizador] ──► [Fim]
## 4. Especificação de Interfaces
- **Interface de Linha de Comando (CLI) / Interativa:**
  - Entrada: `valor` (float), `moeda_origem` (string), `moeda_destino` (string).
  - Saída: `valor_convertido` (float arredondado a 2 casas) ou `ValueError`.

## 5. Armazenamento / Banco de Dados
- Não requer banco de dados persistente nesta versão. As taxas base estão estruturadas num dicionário interno de cotações em memória.
