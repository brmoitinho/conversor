# Documentação Técnica: Conversor de Moedas (Agile Docs & Code)

## 1. Objetivo
Este documento define os critérios de aceitação da funcionalidade de conversão de moedas e a especificação técnica da funcionalidade de login, incluindo fluxo, interfaces, armazenamento e integrações.
O objetivo é fornecer uma referência suficiente para implementação, testes funcionais, testes de segurança e validação com produto.

## 2. Escopo funcional do conversor de moedas
A primeira versão deverá permitir conversões entre as seguintes moedas:

<img width="1285" height="456" alt="image" src="https://github.com/user-attachments/assets/a365229f-ee09-4f69-8770-2736e985dda1" />

O conjunto inicial contempla todas as combinações entre BRL, USD e EUR, desde que a moeda de origem e a moeda de destino sejam diferentes. 
A fonte das taxas de câmbio pode ser uma API externa ou uma tabela de taxas mantida pela aplicação; essa decisão deve ser definida antes da implementação produtiva.

### 2.1 Critérios de aceitação
#### 2.1.1 Seleção da moeda de origem
•	O sistema deve disponibilizar um campo para seleção da moeda de origem.

•	O campo deve apresentar, no mínimo, BRL, USD e EUR.

•	Cada opção deve mostrar o código da moeda e, quando aplicável, o símbolo; por exemplo, BRL — R$.

•	O sistema deve impedir uma conversão quando a moeda de origem não estiver definida.

#### 2.1.2 Seleção da moeda de destino
•	O sistema deve disponibilizar um campo para seleção da moeda de destino.

•	O campo deve apresentar, no mínimo, BRL, USD e EUR.

•	O sistema deve impedir uma conversão quando a moeda de destino não estiver definida.

#### 2.1.3 Entrada do valor
•	O usuário deve conseguir informar a quantidade da moeda de origem.

•	O campo deve aceitar valores decimais de acordo com a localidade da interface.

•	Para a interface em português do Brasil, a vírgula deve ser aceita como separador decimal; a aplicação pode normalizar internamente para ponto.

•	Valores vazios, negativos, não numéricos ou fora do limite suportado devem ser rejeitados com mensagem clara.

•	O sistema deve preservar precisão suficiente durante o cálculo, sem arredondar prematuramente o valor de entrada.

#### 2.1.4 Exibição do resultado
•	Após uma entrada válida e com as duas moedas selecionadas, o sistema deve exibir o valor equivalente na moeda de destino.

•	O resultado deve ser acompanhado do código ou símbolo da moeda de destino, por exemplo: US$ 100,00, EUR 92,50 ou R$ 540,00.

•	A tela deve identificar claramente qual é a moeda de origem e qual é a moeda de destino.

#### 2.1.5 Precisão mínima
•	O resultado deve ser exibido com, no mínimo, duas casas decimais.

•	O cálculo interno deve usar tipo numérico apropriado para valores monetários, preferencialmente decimal de precisão fixa ou inteiro em unidade mínima, evitando erros de ponto flutuante.

•	A regra padrão de apresentação será ROUND_HALF_UP (arredondamento convencional: 0,005 sobe para 0,01).

#### 2.1.6 Taxa de conversão
•	O sistema deve aplicar a taxa correspondente ao par de moedas selecionado.

•	Quando a origem e o destino forem iguais, a taxa deve ser 1,000000 e o resultado deve ser igual ao valor de entrada após a formatação monetária.

•	A resposta deve informar, quando disponível, a data/hora da taxa utilizada e sua fonte.

•	Se a taxa não estiver disponível, o sistema não deve exibir um resultado potencialmente incorreto; deve informar a indisponibilidade e orientar o usuário a tentar novamente.

#### 2.1.7 Escopo mínimo de moedas
•	A funcionalidade deve suportar com precisão os códigos BRL, USD e EUR.

•	Códigos fora dessa lista devem ser rejeitados pela API e pela interface.

•	A lista de moedas não deve depender de digitação livre para evitar códigos inválidos.

#### 2.1.8 Mensagens de validação
•	As mensagens devem indicar o problema e como corrigi-lo.

•	Exemplos:
◦	Informe um valor maior que zero.

◦	Selecione a moeda de origem.

◦	Selecione a moeda de destino.

◦	Não foi possível obter a taxa de câmbio. Tente novamente.

### 2.2 Cenários de referência
Funcionalidade: Conversão de moedas:
 
  Cenário: Converter USD para BRL com valor válido
  
    Dado que a moeda de origem é "USD"
    
    E que a moeda de destino é "BRL"
    
    E que o valor informado é "100,00"
    
    Quando o usuário solicita a conversão
    
    Então o sistema deve calcular usando a taxa vigente de USD para BRL
    
    E deve exibir o resultado com pelo menos duas casas decimais
    
    E deve exibir o código ou símbolo "BRL" ou "R$"
 
  Cenário: Rejeitar valor inválido
    Dado que a moeda de origem e a moeda de destino foram selecionadas
    
    Quando o usuário informa um valor negativo ou não numérico
    
    Então o sistema não deve realizar a conversão
    
    E deve exibir uma mensagem de validação compreensível
 
  Cenário: Converter moedas iguais
    Dado que a moeda de origem é "EUR"
    
    E que a moeda de destino é "EUR"
    
    E que o valor informado é "10,00"
    
    Quando o usuário solicita a conversão
    
    Então o resultado deve ser "10,00 EUR"
 
  Cenário: Taxa indisponível
    Dado que a taxa do par selecionado não está disponível
    
    Quando o usuário solicita a conversão
    
    Então o sistema não deve exibir um resultado estimado como definitivo
    
    E deve informar que a taxa está indisponível

## 3. Documentação técnica da funcionalidade de login
### 3.1 Descrição
A funcionalidade de login autentica um usuário existente e cria uma sessão segura para acesso às áreas protegidas da aplicação. O fluxo base utiliza:
•	identificador: e-mail;

•	credencial: senha;

•	sessão: token de acesso de curta duração e, opcionalmente, token de renovação;

•	proteção: limitação de tentativas, mensagens genéricas e armazenamento seguro de senha.

O login não deve criar usuários. 

O cadastro, recuperação de senha, autenticação multifator e login social são funcionalidades relacionadas, mas ficam fora do escopo obrigatório desta primeira versão, salvo decisão posterior do produto.

### 3.2 Requisitos funcionais
<img width="1067" height="962" alt="image" src="https://github.com/user-attachments/assets/94189d05-01e4-4db4-99fb-69a07fe025da" />

### 3.3 Requisitos não funcionais e de segurança
•	As senhas nunca devem ser armazenadas em texto puro.

•	A comunicação deve ocorrer exclusivamente sobre HTTPS em ambientes não locais.

•	Tokens de sessão devem ser aleatórios, não previsíveis e possuir expiração.

•	Erros de autenticação devem usar resposta genérica, como E-mail ou senha inválidos.

•	Entradas devem ser validadas no cliente para usabilidade e no servidor como regra de segurança.

•	Logs não devem conter senha, token, cookie de sessão ou outros segredos.

•	Após logout, o token ou sessão correspondente deve ser invalidado ou colocado em lista de revogação, conforme o modelo adotado.

## 4.Diagrama de fluxo do login
<img width="940" height="857" alt="image" src="https://github.com/user-attachments/assets/78940aaa-536d-45a7-b656-b6fa54660844" />

## 5. Fluxo de logout
<img width="940" height="641" alt="image" src="https://github.com/user-attachments/assets/a68f1c04-e828-470e-94ae-cee2a46ac214" />

## 6. Interfaces necessárias
### 6.1 Interface visual: tela de login
Componentes mínimos:
1	campo E-mail;

2	campo Senha, com opção de mostrar/ocultar o conteúdo sem expô-lo por padrão;

3	botão Entrar;

4	estado de carregamento durante a requisição;

5	área de mensagem de erro acessível;

6	link opcional Esqueci minha senha, somente se o fluxo de recuperação estiver implementado.

Comportamento esperado:
•	o botão deve ficar desabilitado durante o envio para evitar requisições duplicadas;

•	a tecla Enter deve enviar o formulário quando os campos forem válidos;

•	mensagens devem ser associadas aos campos usando atributos acessíveis;

•	o foco deve ser direcionado para o primeiro erro após uma tentativa inválida;

•	credenciais não devem aparecer em URLs, histórico ou logs do navegador.

### 6.2 Contrato HTTP — login
Endpoint: POST/api/auth/login

Content-Type: application/json

Requisição:

JSON
{
  "email": "usuario@exemplo.com",
  "password": "senha-do-usuario"
}

Resposta de sucesso - 200 OK:

JSON
{
  "user": {
    "id": "usr_123",
    "email": "usuario@exemplo.com",
    "name": "Nome do usuário"
  },
  "expiresAt": "2026-09-27T23:00:00Z"
}

O token pode ser entregue em cookie seguro, preferencialmente para aplicações web. Se a arquitetura exigir token no corpo, o cliente deverá mantê-lo em armazenamento apropriado e nunca em local acessível por scripts não confiáveis.

Resposta de credencial inválida - 401 Unauthorized:

JSON
{
  "code": "INVALID_CREDENTIALS",
  "message": "E-mail ou senha inválidos."
}

Resposta por excesso de tentativas - 429 Too Many Requests:

JSON
{
  "code": "TOO_MANY_ATTEMPTS",
  "message": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "retryAfterSeconds": 300
}

### 5.3 Contrato HTTP - sessão atual
Endpoint: GET /api/auth/me

Autenticação: cookie de sessão ou Authorization: Bearer <token>

Resposta - 200 OK:

JSON
{
  "user": {
    "id": "usr_123",
    "email": "usuario@exemplo.com",
    "name": "Nome do usuário"
  }
}

Sem sessão válida - 401 Unauthorized:

JSON
{
  "code": "UNAUTHENTICATED",
  "message": "Autenticação necessária."
}

### 6.4 Contrato HTTP - logout
Endpoint: POST /api/auth/logout

Resposta - 204 No Content.

O servidor deve invalidar a sessão correspondente e limpar o cookie de autenticação, quando aplicável.

## 7. Banco de dados e armazenamento
### 7.1 Tabela users
<img width="1067" height="1075" alt="image" src="https://github.com/user-attachments/assets/8a9bbf69-4a88-4642-ad43-abd4efc4e19d" />

### 7.2 Tabela sessions (opção recomendada para sessão revogável)
<img width="1060" height="816" alt="image" src="https://github.com/user-attachments/assets/ab655b6f-7898-4cf5-b081-24b12c500e3d" />

Índices recomendados:
•	users(email) com unicidade sem distinção entre maiúsculas e minúsculas;

•	sessions(token_hash);

•	sessions(user_id, expires_at);

•	índice para limpeza de sessões expiradas.

## 8. APIs e serviços externos
### 8.1 Dependências obrigatórias do login
Na configuração mínima, o login não exige serviço externo: a aplicação pode validar o e-mail e o hash de senha no próprio backend e armazenar sessões no banco de dados.

Serviços internos necessários:

•	API/backend responsável por autenticação;

•	banco de dados para usuários e sessões;

•	serviço de cache/Redis opcional para rate limiting;

•	mecanismo de logs e auditoria, sem dados secretos.

### 8.2 Dependências opcionais
<img width="1062" height="341" alt="image" src="https://github.com/user-attachments/assets/54722fc9-7822-471d-bede-732c71ca376f" />

## 9. Regras de autorização após o login
•	Autenticação e autorização são responsabilidades diferentes: estar logado não implica ter acesso a todos os recursos.

•	Cada rota protegida deve validar a sessão no backend.

•	O cliente pode ocultar elementos da interface, mas o servidor deve ser a fonte de verdade para permissões.

•	Em sessão ausente, expirada ou revogada, a API deve responder 401.

•	Em sessão válida, mas sem permissão para o recurso, a API deve responder 403.
