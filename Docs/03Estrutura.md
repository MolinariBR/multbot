# 📂 Estrutura do Projeto - MultBot

## Visão Geral

Monorepo gerenciado com **pnpm workspaces** contendo frontend React e backend Fastify.

```
multbot/
├── .github/                    # GitHub Actions e templates
├── Docs/                       # Documentação do projeto
├── packages/
│   ├── frontend/               # App React + Vite
│   └── backend/                # API Fastify + Prisma
├── package.json                # Root workspace
├── pnpm-workspace.yaml
└── README.md
```

---

## Estrutura Detalhada

### Root

```
multbot/
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
├── .gitignore
├── package.json                # Scripts do monorepo
├── pnpm-lock.yaml
├── pnpm-workspace.yaml         # Define workspaces
└── README.md                   # Documentação principal
```

### Documentação

```
Docs/
├── Projeto.md                  # Descrição do projeto
├── 01Pages.md                  # Documentação das páginas
├── 02Fluxos.md                 # Fluxos do sistema
├── 03Estrutura.md              # Este arquivo
├── MultBot-OpenAPI-3.0.yaml    # Spec da API MultBot
├── Depix-OpenAPI-3.0.0.yaml    # Spec da API Depix (referência)
└── Pix2DePix API.apidog.json   # Coleção Apidog
```

---

## Frontend (`packages/frontend/`)

### Estrutura Principal

```
packages/frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/             # Componentes reutilizáveis
│   ├── pages/                  # Páginas da aplicação
│   ├── lib/                    # Utilitários e configurações
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types/interfaces
│   ├── App.tsx                 # Roteamento principal
│   ├── main.tsx                # Entry point
│   └── index.css               # Estilos globais Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── .env.example
```

### Componentes (`src/components/`)

```
src/components/
├── layout/
│   ├── Layout.tsx              # Shell principal (sidebar + header)
│   ├── Sidebar.tsx             # Menu lateral
│   └── Header.tsx              # Barra superior
├── auth/
│   └── ProtectedRoute.tsx      # Guard de autenticação
├── common/
│   ├── Card.tsx                # Card genérico
│   ├── Button.tsx              # Botão estilizado
│   ├── Input.tsx               # Input com label
│   ├── Modal.tsx               # Modal genérico
│   ├── Badge.tsx               # Status badges
│   ├── Table.tsx               # Tabela genérica
│   ├── Pagination.tsx          # Controles de paginação
│   ├── SearchInput.tsx         # Campo de busca
│   ├── FilterTabs.tsx          # Tabs de filtro
│   ├── LoadingSkeleton.tsx     # Skeleton loading
│   └── EmptyState.tsx          # Estado vazio
├── dashboard/
│   ├── StatsCard.tsx           # Card de KPI
│   ├── BotsTable.tsx           # Tabela de bots resumida
│   └── TopBotsList.tsx         # Lista top bots
├── bots/
│   ├── BotCard.tsx             # Card individual do bot
│   ├── BotGrid.tsx             # Grid de bots
│   ├── CreateBotModal.tsx      # Modal de criação
│   └── EditBotModal.tsx        # Modal de edição
├── transactions/
│   ├── TransactionRow.tsx      # Linha da tabela
│   ├── TransactionTable.tsx    # Tabela completa
│   ├── TransactionFilters.tsx  # Filtros combinados
│   └── ExportButton.tsx        # Botão exportar
└── settings/
    ├── PlatformSection.tsx     # Seção taxa plataforma
    ├── DepixSection.tsx        # Seção integração Depix
    ├── TelegramSection.tsx     # Seção integração Telegram
    ├── AccountSection.tsx      # Seção conta admin
    └── NotificationsSection.tsx # Seção notificações
```

### Páginas (`src/pages/`)

```
src/pages/
├── Login.tsx                   # /login
├── Dashboard.tsx               # /painel
├── BotManagement.tsx           # /bots
├── BotDetails.tsx              # /bots/:id (NOVO)
├── TransactionHistory.tsx      # /transacoes
├── TransactionDetails.tsx      # /transacoes/:id (NOVO)
└── Settings.tsx                # /configuracoes (NOVO)
```

### Utilitários (`src/lib/`)

```
src/lib/
├── api.ts                      # Cliente Axios configurado
├── constants.ts                # Constantes da aplicação
├── formatters.ts               # Formatadores (moeda, data, etc)
├── validators.ts               # Validações de formulário
└── storage.ts                  # Helpers localStorage
```

### Hooks (`src/hooks/`)

```
src/hooks/
├── useAuth.ts                  # Contexto de autenticação
├── useBots.ts                  # CRUD de bots
├── useTransactions.ts          # Listagem transações
├── useDashboard.ts             # Dados do dashboard
├── useSettings.ts              # Configurações
└── usePagination.ts            # Lógica de paginação
```

### Types (`src/types/`)

```
src/types/
├── index.ts                    # Re-exports
├── auth.ts                     # LoginRequest, LoginResponse
├── bot.ts                      # Bot, CreateBotRequest, etc
├── transaction.ts              # Transaction, TransactionFilters
├── dashboard.ts                # DashboardStats
└── settings.ts                 # Settings, DepixConfig, etc
```

---

## Backend (`packages/backend/`)

### Estrutura Principal

```
packages/backend/
├── prisma/
│   ├── schema.prisma           # Modelos do banco
│   ├── migrations/             # Histórico de migrations
│   ├── seed.ts                 # Seed de dados iniciais
│   └── dev.db                  # SQLite (gitignore)
├── src/
│   ├── index.ts                # Entry point
│   ├── app.ts                  # Instância Fastify
│   ├── config/                 # Configurações
│   ├── modules/                # Módulos de domínio
│   ├── telegram/               # Lógica do bot Telegram
│   ├── integrations/           # Integrações externas
│   └── lib/                    # Utilitários compartilhados
├── package.json
├── tsconfig.json
└── .env.example
```

### Configurações (`src/config/`)

```
src/config/
├── env.ts                      # Variáveis de ambiente (Zod)
├── cors.ts                     # Configuração CORS
├── swagger.ts                  # Configuração OpenAPI
└── logger.ts                   # Configuração de logs
```

### Módulos (`src/modules/`)

Cada módulo segue a estrutura:
```
module/
├── *.routes.ts                 # Definição de rotas
├── *.service.ts                # Lógica de negócio
├── *.schema.ts                 # Schemas Zod
└── *.types.ts                  # Types específicos (opcional)
```

```
src/modules/
├── auth/
│   ├── auth.routes.ts          # POST /auth/login
│   ├── auth.service.ts         # Login, validação JWT
│   └── auth.schema.ts          # LoginSchema
├── dashboard/
│   ├── dashboard.routes.ts     # GET /dashboard/stats
│   └── dashboard.service.ts    # Agregação de KPIs
├── bots/
│   ├── bots.routes.ts          # CRUD /bots
│   ├── bots.service.ts         # Lógica de bots
│   └── bots.schema.ts          # CreateBotSchema, UpdateBotSchema
├── transactions/
│   ├── transactions.routes.ts  # GET /transactions
│   ├── transactions.service.ts # Listagem, filtros, export
│   └── transactions.schema.ts  # TransactionFilterSchema
└── settings/
    ├── settings.routes.ts      # GET/PUT /settings
    ├── settings.service.ts     # Lógica de configurações
    └── settings.schema.ts      # SettingsSchema
```

### Telegram (`src/telegram/`)

```
src/telegram/
├── bot.ts                      # Factory de instâncias de bot
├── manager.ts                  # Gerenciador de bots ativos
├── handlers/
│   ├── start.handler.ts        # /start command
│   ├── payment.handler.ts      # Fluxo de pagamento
│   └── callback.handler.ts     # Inline callbacks
├── keyboards/
│   ├── main.keyboard.ts        # Menu principal
│   └── price.keyboard.ts       # Seleção de preço
└── utils/
    ├── qrcode.ts               # Geração de QR Code
    └── messages.ts             # Templates de mensagens
```

### Integrações (`src/integrations/`)

```
src/integrations/
├── depix/
│   ├── client.ts               # Cliente HTTP Depix
│   ├── types.ts                # Types da API Depix
│   └── webhook.ts              # Handler de webhooks
└── telegram-auth/
    ├── session.ts              # Gerenciamento de sessão
    └── auth.ts                 # Autenticação MTProto
```

### Utilitários (`src/lib/`)

```
src/lib/
├── prisma.ts                   # Singleton Prisma Client
├── jwt.ts                      # Helpers JWT (sign, verify)
├── hash.ts                     # Helpers bcrypt
├── error.ts                    # Classes de erro customizadas
└── response.ts                 # Helpers de resposta HTTP
```

---

## Arquivos de Configuração

### Root

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Scripts: `dev`, `build`, `test`, `lint` |
| `pnpm-workspace.yaml` | Define `packages/*` como workspaces |
| `.gitignore` | node_modules, .env, *.db, dist |

### Frontend

| Arquivo | Descrição |
|---------|-----------|
| `vite.config.ts` | Build config, alias `@/` → `src/` |
| `tsconfig.json` | TypeScript strict mode |
| `tailwind.config.js` | Tema customizado (cores, fonts) |
| `postcss.config.js` | Plugins: tailwindcss, autoprefixer |
| `.env.example` | `VITE_API_URL=http://localhost:3000/api` |

### Backend

| Arquivo | Descrição |
|---------|-----------|
| `tsconfig.json` | ESNext, NodeNext modules |
| `prisma/schema.prisma` | Modelos: Admin, Bot, Transaction |
| `.env.example` | Ver seção abaixo |

---

## Variáveis de Ambiente

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (`.env`)

```env
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Auth
JWT_SECRET=sua-chave-secreta-256-bits
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=file:./dev.db

# Admin Seed
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=password123
ADMIN_NAME=Administrador

# Depix
DEPIX_API_URL=https://api.depix.com
DEPIX_API_KEY=sua-api-key
DEPIX_WEBHOOK_SECRET=seu-webhook-secret

# Telegram (MTProto)
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=abcdef1234567890
TELEGRAM_PHONE=+5511999999999
```

---

## Scripts NPM

### Root (`package.json`)

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  }
}
```

### Frontend

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

### Backend

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "lint": "eslint src/"
  }
}
```

---

## Ordem de Desenvolvimento Sugerida

### Fase 1: Fundação
1. `packages/backend/src/config/` - Variáveis de ambiente
2. `packages/backend/prisma/schema.prisma` - Modelos
3. `packages/backend/src/lib/` - Utilitários base
4. `packages/backend/src/app.ts` - Setup Fastify

### Fase 2: Auth
5. `packages/backend/src/modules/auth/` - Login
6. `packages/backend/prisma/seed.ts` - Admin inicial
7. Testar login via frontend existente

### Fase 3: Core
8. `packages/backend/src/modules/bots/` - CRUD
9. `packages/backend/src/modules/dashboard/` - Stats
10. `packages/backend/src/modules/transactions/` - Listagem

### Fase 4: Telegram
11. `packages/backend/src/telegram/` - Bot factory
12. Integrar criação de bot com Telegram

### Fase 5: Integrações
13. `packages/backend/src/integrations/depix/` - API Depix
14. Webhooks de pagamento
15. `packages/frontend/src/pages/Settings.tsx` - Configurações

### Fase 6: Polish
16. Páginas de detalhes (Bot, Transaction)
17. Exportação CSV
18. Notificações
