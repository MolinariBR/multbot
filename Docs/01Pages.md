# 📄 Páginas do Frontend - MultBot

## Sumário

| # | Página | Rota | Status | Prioridade |
|---|--------|------|--------|------------|
| 1 | [Login](#1-login) | `/login` | ✅ Implementada | - |
| 2 | [Dashboard](#2-dashboard-painel) | `/painel` | ✅ Implementada | - |
| 3 | [Gerenciamento de Bots](#3-gerenciamento-de-bots) | `/bots` | ⚠️ Mock Data | - |
| 4 | [Histórico de Transações](#4-histórico-de-transações) | `/transacoes` | ⚠️ Mock Data | - |
| 5 | [Configurações](#5-configurações-nova) | `/configuracoes` | ❌ Não existe | Alta |
| 6 | [Detalhes do Bot](#6-detalhes-do-bot-nova) | `/bots/:id` | ❌ Não existe | Média |
| 7 | [Detalhes da Transação](#7-detalhes-da-transação-nova) | `/transacoes/:id` | ❌ Não existe | Baixa |

---

## Páginas Existentes

### 1. Login

**Arquivo:** `src/pages/Login.tsx`  
**Rota:** `/login`  
**Status:** ✅ Implementada e conectada à API

#### Funcionalidades
- [x] Formulário de email/senha
- [x] Validação de campos
- [x] Chamada à API `/auth/login`
- [x] Armazenamento de JWT no localStorage
- [x] Feedback visual (loading, erro, sucesso)
- [x] Redirecionamento para `/painel` após login
- [x] Exibição de credenciais de teste

#### Layout
- Logo MultiBot centralizada
- Card com formulário
- Background com gradientes animados
- Design responsivo

---

### 2. Dashboard (Painel)

**Arquivo:** `src/pages/Dashboard.tsx`  
**Rota:** `/painel`  
**Status:** ✅ Implementada e conectada à API

#### Funcionalidades
- [x] Cards de KPIs (Total de Bots, Transações, Receita, Taxa de Sucesso)
- [x] Tabela com lista de bots do admin
- [x] Top Bots por receita
- [x] Loading skeleton
- [x] Tratamento de erros
- [x] Chamadas à API `/dashboard/stats` e `/bots`

#### Dados Exibidos
| Card | Campo API | Formato |
|------|-----------|---------|
| Total de Bots | `botsCount` | Número |
| Transações | `transactionsCount` | Número |
| Receita Total | `totalRevenue` | R$ (centavos → reais) |
| Taxa de Sucesso | `successRate` | Percentual |

---

### 3. Gerenciamento de Bots

**Arquivo:** `src/pages/BotManagement.tsx`  
**Rota:** `/bots`  
**Status:** ⚠️ Mock Data (dados hardcoded)

#### Funcionalidades Implementadas (UI)
- [x] Header com título e botão "Criar Novo Bot"
- [x] Campo de busca por nome, owner, telegram
- [x] Filtros: Todos, Ativos, Inativos
- [x] Grid de cards de bots
- [x] Cada card exibe: Nome, Owner, @telegram, Status, Transações, Depix Balance, Revenue Split
- [x] Botões "View Details" e "Manage"

#### Pendente (Integração)
- [ ] Conectar à API `GET /bots`
- [ ] Modal de criação de bot → `POST /bots`
- [ ] Ação "View Details" → navegar para `/bots/:id`
- [ ] Ação "Manage" → abrir modal de edição
- [ ] Alternar status ativo/inativo

---

### 4. Histórico de Transações

**Arquivo:** `src/pages/TransactionHistory.tsx`  
**Rota:** `/transacoes`  
**Status:** ⚠️ Mock Data (dados hardcoded)

#### Funcionalidades Implementadas (UI)
- [x] Header com botão "Exportar Dados"
- [x] Campo de busca por ID, bot, cliente
- [x] Seletor de data (de/até)
- [x] Filtros de status: Todos, Concluído, Processando, Falhou
- [x] Tabela com colunas: ID, Bot/Cliente, Valor/Depix, Split, Status, Data, Ações
- [x] Paginação (UI estática)

#### Pendente (Integração)
- [ ] Conectar à API `GET /transactions`
- [ ] Filtros funcionais (enviar query params)
- [ ] Paginação real
- [ ] Exportar CSV → `GET /transactions/export`
- [ ] Ver detalhes → navegar para `/transacoes/:id`

---

## Páginas Faltantes

### 5. Configurações (NOVA)

**Arquivo:** `src/pages/Settings.tsx` (a criar)  
**Rota:** `/configuracoes`  
**Status:** ❌ Não existe  
**Prioridade:** 🔴 Alta

#### Seções Necessárias

##### 5.1 Configurações da Plataforma
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Taxa Padrão (%) | Input numérico | Split da plataforma (padrão: 10%) |
| Taxa Mínima (%) | Input numérico | Limite inferior permitido |
| Taxa Máxima (%) | Input numérico | Limite superior permitido |

##### 5.2 Integração Depix
| Campo | Tipo | Descrição |
|-------|------|-----------|
| API URL | Input texto | URL base da API Depix |
| API Key | Input senha | Chave de autenticação |
| Webhook Secret | Input senha | Segredo para validar webhooks |
| Status Conexão | Badge | Verde: OK, Vermelho: Erro |
| Botão Testar | Button | Testa conexão com a API |

##### 5.3 Integração Telegram
| Campo | Tipo | Descrição |
|-------|------|-----------|
| API ID | Input texto | Telegram API ID (MTProto) |
| API Hash | Input senha | Telegram API Hash |
| Phone Number | Input telefone | Número para autenticação |
| Session Status | Badge | Conectado/Desconectado |
| Botão Autenticar | Button | Inicia fluxo de autenticação |

##### 5.4 Conta do Administrador
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome | Input texto | Nome do admin |
| Email | Input email | Email (readonly) |
| Senha Atual | Input senha | Para alteração de senha |
| Nova Senha | Input senha | Nova senha |
| Confirmar Senha | Input senha | Confirmação |

##### 5.5 Notificações
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Email Transações | Toggle | Notificar por email |
| Telegram Alerts | Toggle | Alertas no Telegram do admin |
| Valor Mínimo Notificação | Input numérico | Valor mínimo para notificar |

#### Endpoints Necessários
```
GET  /api/settings           → Carregar configurações
PUT  /api/settings           → Salvar configurações
POST /api/settings/test-depix → Testar conexão Depix
POST /api/settings/telegram/auth → Iniciar autenticação Telegram
```

---

### 6. Detalhes do Bot (NOVA)

**Arquivo:** `src/pages/BotDetails.tsx` (a criar)  
**Rota:** `/bots/:id`  
**Status:** ❌ Não existe  
**Prioridade:** 🟡 Média

#### Funcionalidades Propostas
- Informações completas do bot
- Gráficos de receita (dia, semana, mês)
- Últimas 20 transações do bot
- Botão de editar/excluir
- Log de atividades do bot
- QR Code do bot Telegram

#### Dados a Exibir
| Seção | Campos |
|-------|--------|
| Header | Nome, Status, @telegram, Criado em |
| Stats | Receita total, hoje, semana, mês |
| Owner | Nome do logista, Endereço Depix |
| Split | Taxa configurada, Total repassado |
| Transações | Tabela com últimas transações |

---

### 7. Detalhes da Transação (NOVA)

**Arquivo:** `src/pages/TransactionDetails.tsx` (a criar)  
**Rota:** `/transacoes/:id`  
**Status:** ❌ Não existe  
**Prioridade:** 🟢 Baixa

#### Funcionalidades Propostas
- Todas as informações da transação
- Timeline de status
- Dados do PIX (QR Code original, chave)
- Dados da conversão Depix
- Link para transação na blockchain Liquid

#### Dados a Exibir
| Seção | Campos |
|-------|--------|
| Header | ID, Status, Data/Hora |
| Valores | BRL, Depix, Merchant Split, Admin Split |
| Bot | Nome, @telegram (link) |
| Cliente | Nome, Chave PIX |
| Blockchain | TX ID Liquid (link explorer) |

---

## Arquivo Não Roteado

### StoreManagement.tsx

**Arquivo:** `src/pages/StoreManagement.tsx`  
**Status:** Existe mas NÃO está no `App.tsx`

Este arquivo parece ser uma versão alternativa/anterior do gerenciamento de "lojas" com funcionalidade de geração de PIX. Pode ser removido ou refatorado para outra finalidade.

---

## Próximos Passos

1. **Criar página de Configurações** (`/configuracoes`) - Prioridade Alta
2. **Atualizar `App.tsx`** com nova rota
3. **Atualizar `Layout.tsx`** com item no menu sidebar
4. **Integrar BotManagement com API real**
5. **Integrar TransactionHistory com API real**
6. **Criar página BotDetails** quando CRUD estiver funcional
