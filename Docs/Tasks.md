# ✅ Tasks - Guia de Desenvolvimento MultBot

## Referências

| Documento | Descrição |
|-----------|-----------|
| [README.md](../README.md) | Visão geral do projeto e stack |
| [MultBot-OpenAPI-3.0.yaml](./MultBot-OpenAPI-3.0.yaml) | Especificação completa da API |
| [01Pages.md](./01Pages.md) | Páginas do frontend |
| [02Fluxos.md](./02Fluxos.md) | Fluxos do sistema |
| [03Estrutura.md](./03Estrutura.md) | Estrutura de diretórios |
| [04User-Stories.md](./04User-Stories.md) | User stories e priorização |

---

## Legenda

- `[ ]` Não iniciado
- `[/]` Em progresso
- `[x]` Concluído
- `⚠️` Existe mas precisa de ajustes
- `✅` Já implementado

---

## Fase 1: Setup do Backend

### TASK-001: Criar Estrutura Base do Backend

> Ref: [03Estrutura.md - Backend](./03Estrutura.md#backend-packagesbackend)

- [x] Criar diretório `packages/backend/`
- [x] Criar `package.json` com dependências (ver [README.md](../README.md#backend))
- [x] Criar `tsconfig.json` (ESNext, NodeNext)
- [x] Criar `.env.example` com variáveis necessárias
- [x] Criar estrutura de pastas:
  - [x] `src/`
  - [x] `src/config/`
  - [x] `src/modules/`
  - [x] `src/lib/`
  - [x] `src/telegram/` (criado como `src/modules/telegram/`)
  - [ ] `src/integrations/` (criado como `src/modules/depix/`)
  - [x] `prisma/`

### TASK-002: Configurar Prisma e Database

> Ref: [03Estrutura.md - Prisma](./03Estrutura.md#backend-packagesbackend)

- [x] Instalar Prisma: `pnpm add prisma @prisma/client`
- [x] Criar `prisma/schema.prisma` com models:
  - [x] Model `Admin` (id, email, password, name)
  - [x] Model `Bot` (id, name, telegramToken, ownerName, depixAddress, splitRate, status)
  - [x] Model `Transaction` (id, botId, amountBrl, depixAmount, splits, status)
  - [x] Model `Settings` (singleton para configurações)
- [x] Executar `prisma db push`
- [x] Criar `prisma/seed.ts` para admin inicial
- [x] Testar `prisma studio`

### TASK-003: Configurar Fastify e Middlewares

> Ref: [03Estrutura.md - Config](./03Estrutura.md#configurações-srcconfig)

- [x] Criar `src/app.ts` com instância Fastify
- [x] Criar `src/index.ts` (entry point)
- [x] Criar `src/config/env.ts` com Zod para validar env vars
- [x] Configurar CORS (`@fastify/cors`)
- [x] Configurar Swagger (`@fastify/swagger`)
- [x] Configurar Scalar (`@scalar/fastify-api-reference`)
- [x] Criar `src/lib/prisma.ts` (singleton)
- [x] Criar `src/lib/jwt.ts` (sign, verify helpers)
- [x] Criar `src/lib/hash.ts` (bcrypt helpers)
- [x] Testar: `pnpm dev` deve iniciar na porta 3000

---

## Fase 2: Módulo de Autenticação

### TASK-004: Implementar Login

> Ref: [MultBot-OpenAPI-3.0.yaml - /auth/login](./MultBot-OpenAPI-3.0.yaml) | [02Fluxos.md - Auth](./02Fluxos.md#1-fluxo-de-autenticação) | US-001

- [x] Criar `src/modules/auth/auth.schema.ts` (LoginSchema com Zod)
- [x] Criar `src/modules/auth/auth.service.ts`:
  - [x] Função `login(email, password)` → busca admin, verifica hash, gera JWT
- [x] Criar `src/modules/auth/auth.routes.ts`:
  - [x] `POST /api/auth/login` → retorna `{ accessToken, admin }`
- [x] Registrar rotas no `app.ts`
- [x] Testar com frontend existente (`Login.tsx` ✅ já implementado)

### TASK-005: Implementar Middleware de Autenticação

> Ref: [02Fluxos.md - Verificação Token](./02Fluxos.md#12-verificação-de-token-rotas-protegidas) | US-003

- [x] Criar `src/lib/auth-hook.ts`:
  - [x] Extrair Bearer token do header
  - [x] Verificar JWT
  - [x] Retornar 401 se inválido
- [x] Aplicar hook em todas as rotas exceto `/auth/*`
- [x] Testar: rotas devem retornar 401 sem token

---

## Fase 3: Módulo Dashboard

### TASK-006: Implementar Stats do Dashboard

> Ref: [MultBot-OpenAPI-3.0.yaml - /dashboard/stats](./MultBot-OpenAPI-3.0.yaml) | US-004, US-006

- [x] Criar `src/modules/dashboard/dashboard.service.ts`:
  - [x] Função `getStats()` → queries agregadas (COUNT, SUM, AVG)
  - [x] Calcular botsCount, transactionsCount, totalRevenue, successRate
  - [x] Buscar topBots (ORDER BY revenue DESC LIMIT 5)
- [x] Criar `src/modules/dashboard/dashboard.routes.ts`:
  - [x] `GET /api/dashboard/stats`
- [x] Testar com frontend (`Dashboard.tsx` ✅ já conectado à API)

---

## Fase 4: Módulo de Bots

### TASK-007: Implementar Listagem de Bots

> Ref: [MultBot-OpenAPI-3.0.yaml - GET /bots](./MultBot-OpenAPI-3.0.yaml) | US-007, US-009

- [x] Criar `src/modules/bots/bots.schema.ts`:
  - [x] `ListBotsQuerySchema` (status, search)
- [x] Criar `src/modules/bots/bots.service.ts`:
  - [x] Função `listBots(filters)` → busca com where conditions
  - [x] Incluir contagem de transações e receita total por bot
- [x] Criar `src/modules/bots/bots.routes.ts`:
  - [x] `GET /api/bots`
- [x] Atualizar frontend:
  - [x] `BotManagement.tsx` → remover mock data, usar API

### TASK-008: Implementar Criação de Bot

> Ref: [MultBot-OpenAPI-3.0.yaml - POST /bots](./MultBot-OpenAPI-3.0.yaml) | [02Fluxos.md - Criar Bot](./02Fluxos.md#2-fluxo-de-criação-de-bot) | US-010

- [x] Criar schema `CreateBotSchema` (Zod)
- [x] Implementar `bots.service.createBot()`:
  - [x] Validar token único no DB
  - [ ] Validar token com Telegram API (getMe) - TODO: implementar validação real
  - [x] Criar registro no banco
- [x] Rota `POST /api/bots`
- [x] Criar frontend `CreateBotModal.tsx`:
  - [x] Modal com formulário
  - [x] Campos: nome, token, owner, depix address, taxa
  - [x] Validação client-side
  - [x] Feedback de sucesso/erro
- [x] Registrar modal no `BotManagement.tsx`

### TASK-009: Implementar Detalhes do Bot

> Ref: [MultBot-OpenAPI-3.0.yaml - GET /bots/:id](./MultBot-OpenAPI-3.0.yaml) | [01Pages.md - BotDetails](./01Pages.md#6-detalhes-do-bot-nova) | US-011

- [x] Implementar `bots.service.getBot(id)`:
  - [x] Incluir últimas 10 transações
  - [ ] Calcular stats (hoje, semana, mês) - Retorna dados básicos
- [x] Rota `GET /api/bots/:id`
- [ ] Criar frontend `BotDetails.tsx`:
  - [ ] Header com info do bot
  - [ ] Cards de stats
  - [ ] Tabela de transações
  - [ ] Link QR Code Telegram
- [ ] Adicionar rota `/bots/:id` no `App.tsx`
- [ ] Atualizar sidebar? (opcional)

### TASK-010: Implementar Edição e Exclusão de Bot

> Ref: [MultBot-OpenAPI-3.0.yaml - PATCH/DELETE /bots/:id](./MultBot-OpenAPI-3.0.yaml) | US-012, US-013, US-014

- [x] Criar schema `UpdateBotSchema`
- [x] Implementar `bots.service.updateBot(id, data)`
- [x] Implementar `bots.service.deleteBot(id)` (soft delete)
- [x] Rotas:
  - [x] `PATCH /api/bots/:id`
  - [x] `DELETE /api/bots/:id`
- [ ] Criar frontend `EditBotModal.tsx`
- [ ] Adicionar ações no `BotCard.tsx`

---

## Fase 5: Módulo de Transações

### TASK-011: Implementar Listagem de Transações

> Ref: [MultBot-OpenAPI-3.0.yaml - GET /transactions](./MultBot-OpenAPI-3.0.yaml) | US-015, US-016, US-017, US-018, US-019

- [x] Criar `src/modules/transactions/transactions.schema.ts`:
  - [x] `ListTransactionsQuerySchema` (page, limit, status, botId, search, dateFrom, dateTo, sortBy, sortOrder)
- [x] Criar `src/modules/transactions/transactions.service.ts`:
  - [x] Função `listTransactions(filters)` com paginação
  - [x] Retornar `{ data, pagination }`
- [x] Rota `GET /api/transactions`
- [x] Atualizar frontend:
  - [x] `TransactionHistory.tsx` → remover mock data, usar API
  - [x] Implementar paginação real
  - [x] Implementar filtros funcionais

### TASK-012: Implementar Detalhes e Export

> Ref: [MultBot-OpenAPI-3.0.yaml - GET /transactions/:id e /export](./MultBot-OpenAPI-3.0.yaml) | US-020, US-021

- [x] Implementar `transactions.service.getTransaction(id)`
- [x] Implementar `transactions.service.exportCSV(filters)`
- [x] Rotas:
  - [x] `GET /api/transactions/:id`
  - [x] `GET /api/transactions/export`
- [ ] Criar frontend `TransactionDetails.tsx` (opcional - pode ser modal)
- [x] Implementar download CSV no frontend

---

## Fase 6: Módulo de Configurações

### TASK-013: Implementar CRUD de Settings

> Ref: [MultBot-OpenAPI-3.0.yaml - /settings](./MultBot-OpenAPI-3.0.yaml) | [01Pages.md - Configurações](./01Pages.md#5-configurações-nova) | US-022 a US-027

- [x] Criar `src/modules/settings/settings.schema.ts`
- [x] Criar `src/modules/settings/settings.service.ts`:
  - [x] `getSettings()` → busca settings singleton
  - [x] `updateSettings(data)` → atualiza configurações
  - [x] `testDepixConnection()` → ping API Depix
- [x] Rotas:
  - [x] `GET /api/settings`
  - [x] `PUT /api/settings`
  - [x] `POST /api/settings/test-depix`
- [ ] Criar frontend `Settings.tsx`:
  - [ ] `PlatformSection.tsx` (taxa)
  - [ ] `DepixSection.tsx` (API key, teste conexão)
  - [ ] `TelegramSection.tsx` (auth - fase posterior)
  - [ ] `AccountSection.tsx` (nome, senha)
  - [ ] `NotificationsSection.tsx` (toggles)
- [ ] Adicionar rota `/configuracoes` no `App.tsx`
- [ ] Adicionar item no menu sidebar (`Layout.tsx`)

---

## Fase 7: Bot Telegram

### TASK-014: Implementar Bot Factory

> Ref: [03Estrutura.md - Telegram](./03Estrutura.md#telegram-srctelegram) | US-028 a US-032

- [x] Criar `src/modules/telegram/telegram-bot.service.ts`:
  - [x] Factory para criar instâncias de bot
  - [x] Configurar polling
  - [x] Gerenciar múltiplos bots ativos
  - [x] Iniciar bots ao startup
  - [x] Parar/reiniciar bots
  - [x] Graceful shutdown
- [x] Criar keyboards:
  - [x] `src/telegram/keyboards/main.keyboard.ts`
  - [x] `src/telegram/keyboards/price.keyboard.ts`

### TASK-015: Implementar Handlers do Bot

> Ref: [02Fluxos.md - Pagamento](./02Fluxos.md#3-fluxo-de-pagamento-cliente-final)

- [x] Criar handlers básicos:
  - [x] `/start` - Mensagem de boas-vindas
  - [x] `/ajuda` - Ajuda
  - [x] `/pagar` - Iniciar pagamento (estrutura básica)
  - [x] `/status` - Ver status (estrutura básica)
- [x] Implementar fluxo completo de pagamento:
  - [x] Processar seleção de valor
  - [x] Chamar API Depix para gerar PIX
  - [x] Enviar QR Code
  - [x] Criar Transaction no banco
- [x] Criar `src/telegram/utils/qrcode.ts`:
  - [x] Gerar imagem QR Code
- [x] Criar `src/telegram/utils/messages.ts`:
  - [x] Templates de mensagens

---

## Fase 8: Integração Depix

### TASK-016: Implementar Cliente Depix

> Ref: [Depix-OpenAPI-3.0.0.yaml](./Depix-OpenAPI-3.0.0.yaml) | [02Fluxos.md - Transação](./02Fluxos.md#4-fluxo-de-transação-sistema)

- [x] Criar `src/modules/depix/depix.service.ts`:
  - [x] Cliente HTTP configurado (estrutura)
  - [x] Métodos: createPayment, getPaymentStatus, sendToLiquidAddress
  - [x] Cálculo de split
  - [ ] Implementar chamadas reais à API (atualmente mockado)
- [x] Criar `src/modules/depix/depix.routes.ts`:
  - [x] Webhook para receber notificações
  - [x] Endpoint de teste
- [x] Handler para webhooks de pagamento:
  - [x] Atualizar Transaction no banco
  - [ ] Validar assinatura
  - [ ] Notificar bot Telegram
  - [ ] Processar envio de L-BTC

---

## Fase 9: Ajustes no Frontend Existente

### TASK-017: Refatorar Componentes Existentes

> Ref: [01Pages.md](./01Pages.md) | [03Estrutura.md - Frontend](./03Estrutura.md#frontend-packagesfrontend)

**Páginas que JÁ EXISTEM e precisam de ajustes:**

- [x] `Dashboard.tsx`:
  - [x] Conectado à API ✅
  - [x] Corrigido erro de interface BotData
  - [x] Melhorar handling de erros
  - [x] Adicionar refresh automático
  
- [x] `BotManagement.tsx`:
  - [x] Remover dados mock
  - [x] Conectar à API `GET /bots`
  - [x] Implementar botão "Criar Novo Bot" funcional
  - [x] Implementar botões "View Details" e "Manage"
  
- [x] `TransactionHistory.tsx`:
  - [x] Remover dados mock
  - [x] Conectar à API `GET /transactions`
  - [x] Implementar paginação real
  - [x] Implementar filtros reais
  - [x] Implementar export funcional

- [x] `Login.tsx`:
  - [x] Conectado à API ✅

- [x] `Layout.tsx`:
  - [x] Adicionar link para `/configuracoes` no menu

**Páginas que NÃO EXISTEM e precisam ser criadas:**

- [x] `Settings.tsx` (alta prioridade)
  - [x] Layout com abas (Depix, Geral, Notificações)
  - [x] Integração com API
  - [x] Teste de conexão Depix
- [x] `BotDetails.tsx` (média prioridade)
  - [x] Estatísticas detalhadas
  - [x] Ações de gerenciamento
- [x] `TransactionDetails.tsx` (baixa prioridade)
  - [x] Detalhes completos
  - [x] Visualização de splits

### TASK-018: Criar Componentes Reutilizáveis

> Ref: [03Estrutura.md - Components](./03Estrutura.md#componentes-srccomponents)

- [x] Criar `src/components/`:
  - [x] `CreateBotModal.tsx`
  - [x] `EditBotModal.tsx`
    - [x] Edição de nome, taxas e status
    - [x] Integração com BotManagement
  - [x] `Modal.tsx` (genérico)
  - [x] `Pagination.tsx`
  - [ ] `LoadingSkeleton.tsx` (Débito Técnico: implementado inline)
  - [ ] `EmptyState.tsx` (Débito Técnico: implementado inline)
- [ ] Criar `src/types/` (Débito Técnico: tipos definidos nos arquivos)
- [ ] Criar `src/hooks/` (Débito Técnico: lógica nos componentes)

> **Nota**: Funcionalidades visuais completas. Refatoração de Types/Hooks adiada para polimento futuro.

---

## Fase 10: Polish e Testes

### TASK-019: Testes e Documentação

- [x] Testar fluxo completo: Login → Dashboard → Criar Bot → Transação (parcial)
- [x] Documentar endpoints adicionais no OpenAPI
- [ ] Atualizar README com instruções de deploy
- [ ] Criar docker-compose.yml para produção
- [ ] Configurar CI/CD (GitHub Actions)

### TASK-020: Autenticação Telegram (MTProto)

> Ref: [02Fluxos.md - Telegram Auth](./02Fluxos.md#53-autenticação-telegram) | US-025

- [ ] Criar `src/integrations/telegram-auth/`:
  - [ ] Implementar autenticação MTProto
  - [ ] Salvar session string
- [ ] Implementar no frontend `TelegramSection.tsx`
- [ ] Fluxo de código SMS

---

## Resumo de Arquivos

### Frontend - Já Existem ✅

| Arquivo | Status |
|---------|--------|
| `App.tsx` | ✅ Funcional, adicionar novas rotas |
| `Login.tsx` | ✅ Funcional e conectado à API |
| `Dashboard.tsx` | ✅ Conectado à API e funcionando |
| `BotManagement.tsx` | ✅ Conectado à API e funcionando |
| `TransactionHistory.tsx` | ✅ Conectado à API e funcionando |
| `Layout.tsx` | ✅ Funcional, adicionar link Settings |
| `ProtectedRoute.tsx` | ✅ Funcional |
| `api.ts` | ✅ Cliente Axios configurado |
| `CreateBotModal.tsx` | ✅ Criado e funcionando |

### Frontend - Precisam Ser Criados ❌

| Arquivo | Prioridade |
|---------|------------|
| `Settings.tsx` | 🔴 Alta |
| `EditBotModal.tsx` | 🟡 Média |
| `BotDetails.tsx` | 🟡 Média |
| `TransactionDetails.tsx` | 🟢 Baixa |
| `Modal.tsx` | 🟡 Média |
| `Pagination.tsx` | � Baixa (inline existe) |

### Backend - Status Atual ✅

| Módulo | Status |
|--------|--------|
| Config | ✅ `env.ts`, `cors.ts`, `swagger.ts` |
| Lib | ✅ `prisma.ts`, `jwt.ts`, `hash.ts`, `error.ts`, `auth-hook.ts` |
| Auth | ✅ `routes.ts`, `service.ts`, `schema.ts` |
| Dashboard | ✅ `routes.ts`, `service.ts` |
| Bots | ✅ `routes.ts`, `service.ts`, `schema.ts` (CRUD completo) |
| Transactions | ✅ `routes.ts`, `service.ts`, `schema.ts` (completo) |
| Settings | ✅ `routes.ts`, `service.ts`, `schema.ts` |
| Telegram | ✅ `telegram-bot.service.ts` (estrutura básica) |
| Depix | ✅ `depix.service.ts`, `depix.routes.ts` (estrutura) |

---

## 📊 Progresso Geral

### ✅ Concluído (MVP Funcional)
- Backend API REST completo
- Autenticação JWT
- Dashboard com stats
- CRUD de Bots (com criação via interface)
- Histórico de Transações com filtros e export
- Configurações (backend)
- Estrutura Telegram Bot
- Estrutura Depix
- Frontend totalmente integrado

### 🔄 Em Progresso
- Fluxo completo de pagamento Telegram
- Integração real com Depix API
- Página de Configurações (frontend)

### ⏳ Pendente
- Validação real de token Telegram
- QR Code generation
- Notificações via Telegram
- Autenticação MTProto
- Testes automatizados
- Deploy e CI/CD
