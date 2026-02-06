# 🔄 Fluxos do Sistema - MultBot

## Sumário

1. [Fluxo de Autenticação](#1-fluxo-de-autenticação)
2. [Fluxo de Criação de Bot](#2-fluxo-de-criação-de-bot)
3. [Fluxo de Pagamento (Cliente Final)](#3-fluxo-de-pagamento-cliente-final)
4. [Fluxo de Transação (Sistema)](#4-fluxo-de-transação-sistema)
5. [Fluxo de Configurações](#5-fluxo-de-configurações)
6. [Fluxo de Dashboard](#6-fluxo-de-dashboard)
7. [Fluxo de Gerenciamento de Bots](#7-fluxo-de-gerenciamento-de-bots)

---

## 1. Fluxo de Autenticação

### 1.1 Login do Administrador

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant DB as SQLite

    U->>F: Acessa /login
    U->>F: Preenche email e senha
    F->>A: POST /api/auth/login
    A->>DB: Busca admin por email
    
    alt Admin não encontrado
        A-->>F: 401 { error: "Email ou senha inválidos" }
        F-->>U: Exibe mensagem de erro
    else Admin encontrado
        A->>A: Verifica bcrypt hash
        alt Senha incorreta
            A-->>F: 401 { error: "Email ou senha inválidos" }
            F-->>U: Exibe mensagem de erro
        else Senha correta
            A->>A: Gera JWT (24h)
            A-->>F: 200 { accessToken, admin }
            F->>F: Salva em localStorage
            F-->>U: Redireciona para /painel
        end
    end
```

### 1.2 Verificação de Token (Rotas Protegidas)

```mermaid
flowchart TD
    A[Usuário acessa rota protegida] --> B{Token existe no localStorage?}
    B -->|Não| C[Redireciona para /login]
    B -->|Sim| D[Adiciona Bearer token no header]
    D --> E[Requisição à API]
    E --> F{API valida token}
    F -->|Inválido/Expirado| G[API retorna 401]
    G --> H[Interceptor limpa localStorage]
    H --> C
    F -->|Válido| I[Processa requisição]
    I --> J[Retorna dados]
```

### 1.3 Logout

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    
    U->>F: Clica em Logout
    F->>F: Remove accessToken do localStorage
    F->>F: Remove adminEmail do localStorage
    F->>F: Remove adminName do localStorage
    F-->>U: Redireciona para /login
```

---

## 2. Fluxo de Criação de Bot

### 2.1 Criar Novo Bot Telegram

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant T as Telegram BotFather
    participant DB as SQLite

    Note over U,T: Pré-requisito: Admin já criou bot no BotFather

    U->>F: Clica "Criar Novo Bot"
    F-->>U: Abre modal de criação
    U->>F: Preenche dados (nome, token, owner, depix address)
    F->>A: POST /api/bots
    
    A->>A: Valida dados (Zod)
    alt Dados inválidos
        A-->>F: 400 { error, details }
        F-->>U: Exibe erros de validação
    else Dados válidos
        A->>DB: Verifica se token já existe
        alt Token duplicado
            A-->>F: 409 { error: "Token já em uso" }
            F-->>U: Exibe erro
        else Token único
            A->>T: Valida token com getMe()
            alt Token inválido
                A-->>F: 400 { error: "Token Telegram inválido" }
            else Token válido
                T-->>A: { username, first_name }
                A->>DB: INSERT Bot
                A->>A: Inicia instância do bot
                A-->>F: 201 { bot }
                F-->>U: Fecha modal, atualiza lista
            end
        end
    end
```

### 2.2 Dados Necessários

| Campo | Obrigatório | Validação |
|-------|-------------|-----------|
| name | Sim | 3-100 caracteres |
| telegramToken | Sim | Formato válido Telegram |
| ownerName | Sim | 3-100 caracteres |
| depixAddress | Sim | Endereço Liquid válido |
| splitRate | Não | 0-1 (padrão: 0.10) |

---

## 3. Fluxo de Pagamento (Cliente Final)

### 3.1 Pagamento via Bot Telegram

```mermaid
sequenceDiagram
    participant L as Logista
    participant B as Bot Telegram
    participant C as Cliente Final
    participant A as API Backend
    participant D as Depix API

    L->>B: /start ou /pagar
    B-->>L: Exibe ReplyKeyboard com valores
    
    Note over B: [R$50] [R$150] [R$200]
    Note over B: [R$300] [Personalizado]
    
    L->>B: Seleciona R$150 (ou digita valor)
    B->>A: Solicita criação de cobrança
    A->>D: POST /deposit (via Depix API)
    D-->>A: { pixCode, qrCodeBase64, expiresAt }
    A-->>B: Retorna dados do PIX
    B-->>L: Exibe QR Code + Copia/Cola
    
    L->>C: Mostra QR Code ao cliente
    C->>C: Paga via app do banco
    
    D->>A: Webhook: pagamento confirmado
    A->>A: Calcula split (merchant/admin)
    A->>D: Solicita transferência para logista
    D-->>A: Confirma transferência
    
    A-->>B: Notifica pagamento recebido
    B-->>L: ✅ Pagamento de R$150 confirmado!
```

### 3.2 Reply Keyboard do Bot

```
┌─────────────────────────────────────┐
│ 💰 Selecione o valor da venda:      │
├───────────┬───────────┬─────────────┤
│   R$ 50   │  R$ 150   │   R$ 200    │
├───────────┼───────────┼─────────────┤
│  R$ 300   │  R$ 500   │   R$ 1000   │
├───────────┴───────────┴─────────────┤
│        ✏️ Valor Personalizado        │
└─────────────────────────────────────┘
```

---

## 4. Fluxo de Transação (Sistema)

### 4.1 Ciclo de Vida da Transação

```mermaid
stateDiagram-v2
    [*] --> Criada: Bot solicita pagamento
    Criada --> Processing: PIX gerado
    Processing --> Completed: Pagamento confirmado + Split executado
    Processing --> Failed: Timeout ou erro
    Processing --> Failed: Pagamento não identificado
    Completed --> [*]
    Failed --> [*]
```

### 4.2 Estados e Ações

| Estado | Descrição | Ações Possíveis |
|--------|-----------|-----------------|
| `processing` | PIX gerado, aguardando pagamento | Cancelar, Ver QR Code |
| `completed` | Pagamento confirmado e split executado | Ver detalhes |
| `failed` | Erro ou timeout | Retentar, Ver motivo |

### 4.3 Cálculo do Split

```mermaid
flowchart LR
    A[Valor PIX: R$ 100,00] --> B{Split Rate: 10%}
    B --> C[Merchant: R$ 90,00]
    B --> D[Admin: R$ 10,00]
    C --> E[Transferido para Depix Address do Logista]
    D --> F[Retido na carteira da plataforma]
```

---

## 5. Fluxo de Configurações

### 5.1 Salvar Configurações

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant DB as SQLite

    U->>F: Acessa /configuracoes
    F->>A: GET /api/settings
    A->>DB: SELECT settings
    A-->>F: { settings }
    F-->>U: Exibe formulário preenchido

    U->>F: Altera configurações
    U->>F: Clica "Salvar"
    F->>A: PUT /api/settings
    A->>A: Valida dados
    A->>DB: UPDATE settings
    A-->>F: 200 { settings }
    F-->>U: Toast "Configurações salvas!"
```

### 5.2 Testar Conexão Depix

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant D as Depix API

    U->>F: Clica "Testar Conexão"
    F->>A: POST /api/settings/test-depix
    A->>D: GET /ping (com API Key)
    
    alt Conexão OK
        D-->>A: 200 { status: "ok" }
        A-->>F: { success: true }
        F-->>U: Badge Verde ✅
    else Erro
        D-->>A: 401/500
        A-->>F: { success: false, error }
        F-->>U: Badge Vermelho ❌ + Mensagem
    end
```

### 5.3 Autenticação Telegram

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant T as Telegram API

    U->>F: Preenche API ID, API Hash, Phone
    U->>F: Clica "Autenticar"
    F->>A: POST /api/settings/telegram/auth
    A->>T: Envia código de verificação
    T-->>A: Código enviado para o telefone
    A-->>F: { requiresCode: true }
    F-->>U: Modal para inserir código
    
    U->>F: Insere código recebido
    F->>A: POST /api/settings/telegram/verify
    A->>T: Valida código
    T-->>A: Session válida
    A->>DB: Salva session string
    A-->>F: { success: true }
    F-->>U: Badge "Conectado" ✅
```

---

## 6. Fluxo de Dashboard

### 6.1 Carregamento Inicial

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant DB as SQLite

    U->>F: Acessa /painel
    F->>F: Exibe loading skeleton
    
    par Requisições Paralelas
        F->>A: GET /api/dashboard/stats
        A->>DB: SELECT COUNT(*), SUM(), AVG()
        A-->>F: { botsCount, transactionsCount, totalRevenue, successRate, topBots }
    and
        F->>A: GET /api/bots
        A->>DB: SELECT * FROM bots
        A-->>F: [ bots... ]
    end
    
    F->>F: Processa dados
    F-->>U: Renderiza dashboard completo
```

### 6.2 Dados Agregados (stats)

```sql
-- botsCount
SELECT COUNT(*) FROM bots WHERE status = 'active';

-- transactionsCount  
SELECT COUNT(*) FROM transactions;

-- totalRevenue
SELECT SUM(amountBrl) FROM transactions WHERE status = 'completed';

-- successRate
SELECT 
  (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
FROM transactions;

-- topBots
SELECT b.id, b.name, SUM(t.amountBrl) as revenue
FROM bots b
JOIN transactions t ON t.botId = b.id
WHERE t.status = 'completed'
GROUP BY b.id
ORDER BY revenue DESC
LIMIT 5;
```

---

## 7. Fluxo de Gerenciamento de Bots

### 7.1 Listar Bots com Filtros

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend

    U->>F: Acessa /bots
    F->>A: GET /api/bots
    A-->>F: [ bots... ]
    F-->>U: Exibe grid de bots

    U->>F: Digita no campo de busca
    F->>F: Filtra localmente por nome/owner/telegram
    F-->>U: Atualiza grid

    U->>F: Clica filtro "Ativos"
    F->>A: GET /api/bots?status=active
    A-->>F: [ bots filtrados... ]
    F-->>U: Atualiza grid
```

### 7.2 Editar Bot

```mermaid
sequenceDiagram
    participant U as Admin
    participant F as Frontend
    participant A as API Backend
    participant DB as SQLite

    U->>F: Clica "Manage" no card do bot
    F-->>U: Abre modal com dados atuais
    U->>F: Altera campos (nome, splitRate, status)
    U->>F: Clica "Salvar"
    F->>A: PATCH /api/bots/{id}
    A->>A: Valida dados
    A->>DB: UPDATE bots SET ...
    A-->>F: 200 { bot atualizado }
    F-->>U: Fecha modal, atualiza card
```

### 7.3 Desativar/Ativar Bot

```mermaid
flowchart TD
    A[Admin clica toggle status] --> B{Status atual?}
    B -->|Ativo| C[PATCH /api/bots/{id} status=inactive]
    B -->|Inativo| D[PATCH /api/bots/{id} status=active]
    C --> E[Para polling do bot Telegram]
    D --> F[Reinicia polling do bot Telegram]
    E --> G[Atualiza UI]
    F --> G
```

---

## Fluxos Auxiliares

### Interceptor de Erros (Frontend)

```mermaid
flowchart TD
    A[Resposta da API] --> B{Status code?}
    B -->|2xx| C[Retorna dados]
    B -->|401| D[Limpa localStorage]
    D --> E[Redireciona /login]
    B -->|400| F[Extrai mensagem de erro]
    F --> G[Exibe toast de erro]
    B -->|500| H[Exibe erro genérico]
```

### Refresh de Dados

```mermaid
flowchart LR
    A[Ação do usuário] --> B[Mutação na API]
    B --> C[Sucesso]
    C --> D[Invalidar cache/refetch]
    D --> E[Atualizar UI]
```

---

## Referência de Endpoints por Fluxo

| Fluxo | Endpoints Utilizados |
|-------|---------------------|
| Autenticação | `POST /auth/login` |
| Dashboard | `GET /dashboard/stats`, `GET /bots` |
| Criar Bot | `POST /bots` |
| Listar Bots | `GET /bots`, `GET /bots?status=` |
| Editar Bot | `PATCH /bots/{id}` |
| Deletar Bot | `DELETE /bots/{id}` |
| Transações | `GET /transactions`, `GET /transactions/{id}` |
| Exportar | `GET /transactions/export` |
| Configurações | `GET /settings`, `PUT /settings` |
| Testar Depix | `POST /settings/test-depix` |
| Auth Telegram | `POST /settings/telegram/auth` |
