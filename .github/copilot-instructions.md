---
applyTo: '**'
---

# 🤖 Copilot Instructions - MultiBot

## 📌 Contexto Geral

Este é um **monorepo** com estrutura:

```
packages/
├── frontend/     ← React app (EXISTENTE)
└── backend/      ← Node.js Express (A CRIAR)
```

**Documentação completa:** `/Docs/DEV/` (começa por `START_HERE.txt`)

---

## 👥 Modelos de Negócio

### Admin
- ✅ Cria e configura bots do Telegram
- ✅ Monitora transações e receita
- ✅ Controla % de split por bot
- **Autenticação:** POST `/api/auth/login` (admin-only)
- **Tabela:** `admins` (separada de users)

### Lojista (end-user)
- ✅ Recebe pagamentos Pix via bot do Telegram
- ✅ Interage com bot criado pelo admin
- **Sem conta no sistema** (usa apenas bot do Telegram)

---

## 🎨 Frontend (`packages/frontend/`)

### Páginas Existentes (NÃO CRIAR NOVAS)

| Arquivo | Rota | Status | O que Falta |
|---------|------|--------|------------|
| `Dashboard.tsx` | `/` | ✅ Existe | Remover mocks, consumir API |
| `BotManagement.tsx` | `/bots` | ✅ Existe | Remover mocks, consumir CRUD API |
| `TransactionHistory.tsx` | `/transacoes` | ✅ Existe | Remover mocks, consumir API |
| `Layout.tsx` | - | ✅ Existe | Implementar logout real |

### Novos Arquivos Necessários (Task 12-13)

```typescript
// pages/Login.tsx (NOVO)
- Form email + password
- POST /api/auth/login
- Salvar JWT em localStorage
- Redirecionar se sucesso

// components/ProtectedRoute.tsx (NOVO)
- Verifica JWT em localStorage
- Redireciona para /login se falta
- Wrapper para rotas autenticadas

// lib/api.ts (NOVO)
- Axios instance
- URL base: process.env.VITE_API_URL
- Auto-attach Bearer token
- Refresh logic + error handling
```

### Convenções Frontend

```typescript
// ✅ Imports organizados
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

// ✅ Components são funções nomeadas
export function Dashboard() { ... }

// ✅ Tipos em interfaces ou types
interface Stats {
  botsCount: number;
  totalRevenue: number;
}

// ✅ Tailwind para CSS
<div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
```

---

## 🔧 Backend (`packages/backend/`)

### Arquitetura

```
src/
├── routes/          ← Endpoints (auth.ts, bots.ts, etc)
├── controllers/     ← Business logic (opcional)
├── services/        ← External APIs + DB ops
├── middleware/      ← auth.ts (JWT verification)
├── types/           ← Interfaces TypeScript
├── db/
│   └── schema.prisma ← Database models
└── utils/           ← Helpers
```

### Modelos do Banco (Prisma)

```prisma
model Admin {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String  // bcrypt hash
  name      String
  bots      Bot[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Bot {
  id            Int     @id @default(autoincrement())
  name          String
  telegramToken String  @unique
  depixAddress  String
  splitConfig   Json    // { "multibot": 10, "admin": 90 }
  totalRevenue  Int     @default(0)
  adminId       Int
  admin         Admin   @relation(fields: [adminId], references: [id])
  transactions  Transaction[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Transaction {
  id        Int     @id @default(autoincrement())
  qrId      String  @unique
  amount    Int     // em centavos
  status    String  // "pending", "success", "failed"
  botId     Int
  bot       Bot     @relation(fields: [botId], references: [id])
  createdAt DateTime @default(now())
}
```

### Endpoints da API

**Base:** `http://localhost:3000/api`

#### Auth
- `POST /auth/login` → { email, password }
- `POST /auth/refresh` → Renovar JWT
- `POST /auth/logout` → Limpar cookies
- `GET /auth/me` → Dados do admin autenticado

#### Bots
- `GET /bots` → Listar bots do admin
- `GET /bots/{id}` → Detalhes de um bot
- `POST /bots` → Criar novo bot
- `PATCH /bots/{id}` → Editar bot
- `DELETE /bots/{id}` → Deletar bot

#### Transactions
- `GET /transactions` → Histórico (com filters)

#### Dashboard
- `GET /dashboard/stats` → Stats do admin

#### Webhooks
- `POST /webhooks/depix` → Webhook da Depix

### Middleware de Segurança

```typescript
// ✅ Verificar JWT
import { authMiddleware } from '@/middleware/auth';

app.use(authMiddleware);
// Agora req.adminId está disponível

// ✅ Filtrar por adminId
const bots = await prisma.bot.findMany({
  where: { adminId: req.adminId }
});

// ❌ NUNCA confiar em parâmetros externos
// const bot = await prisma.bot.findUnique({
//   where: { id: req.body.botId } // ❌ Perigo!
// });
```

### Integração Depix

**Base:** `https://depix.eulen.app/api/`

**Endpoints:**
- `POST /deposit` → Criar QR code Pix
- `GET /deposit/{qrId}/status` → Status da transação
- `POST /user-info` → Validar user info

**Webhook:** HMAC-SHA256 validation, idempotent via qrId

**Rate limit:** 10 ops/min para `/deposit` (CRÍTICO!)

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
pnpm install

# Desenvolvimento (frontend + backend em paralelo)
pnpm dev

# Build
pnpm build

# Testes
pnpm test

# Lint
pnpm lint

# Executar em um package específico
pnpm --filter frontend run dev
pnpm --filter backend run dev
```

---

## 📋 Regras Absolutas

### Frontend
- ✅ Use componentes existentes em `/pages/`
- ✅ Remova dados mockados e consuma API
- ✅ Use `@/lib/api` para chamadas HTTP
- ✅ Proteja rotas com `<ProtectedRoute>`

### Backend
- ✅ JWT em httpOnly cookies (stateless)
- ✅ Sempre filtrar por `adminId` em queries
- ✅ Hash passwords com bcrypt
- ✅ Validar entrada com typescript types
- ✅ Logs estruturados para debug

### Geral
- ✅ TypeScript strict mode
- ✅ Sem `any` types
- ✅ Sem `console.log` em produção
- ✅ Prisma para todas as DB queries

---

## 🧪 Testes

Todos os testes estão documentados em `Docs/DEV/04-Tasks.md`:

- **Task 14:** Unit tests
- **Task 15:** Integration tests

---

## 📚 Documentação Referência

| Arquivo | Propósito |
|---------|-----------|
| `00-Projeto.md` | Overview e business model |
| `03-QuickStart.md` | Setup 15 min |
| `04-Tasks.md` | **18 tasks com código pronto** |
| `05-OPENAPI.yaml` | Especificação API completa |
| `09-ESTRUTURA.md` | Estrutura de diretórios |

---

## 🔐 Environment Variables

### `.env` (Backend)
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-min-32-chars"
NODE_ENV="development"
PORT=3000
```

### `.env` (Frontend)
```bash
VITE_API_URL="http://localhost:3000/api"
```

---

**Status:** Phase 8 (Users vs Admins refactored)
**Última atualização:** 5 de fevereiro de 2026
