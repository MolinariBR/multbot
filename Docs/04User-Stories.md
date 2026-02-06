# 👤 User Stories - MultBot

## Personas

### Admin (Administrador da Plataforma)
Responsável por gerenciar todos os bots, logistas e configurações da plataforma.

### Logista (Merchant)
Proprietário de um bot que utiliza o sistema para receber pagamentos via PIX/Depix.

### Cliente Final
Consumidor que realiza pagamentos via PIX através do bot do logista.

---

## Épicos

| ID | Épico | Descrição |
|----|-------|-----------|
| E1 | Autenticação | Login e segurança do admin |
| E2 | Dashboard | Visão geral da plataforma |
| E3 | Gerenciamento de Bots | CRUD de bots Telegram |
| E4 | Transações | Histórico e detalhes |
| E5 | Configurações | Configurações da plataforma |
| E6 | Bot Telegram | Fluxo de pagamento do logista |

---

## E1: Autenticação

### US-001: Login do Administrador
**Como** admin  
**Quero** fazer login com email e senha  
**Para** acessar o painel de administração

**Critérios de Aceite:**
- [ ] Campo de email com validação de formato
- [ ] Campo de senha com mínimo 6 caracteres
- [ ] Exibir erro claro para credenciais inválidas
- [ ] Redirecionar para `/painel` após login
- [ ] Salvar token JWT no localStorage
- [ ] Exibir loading durante autenticação

**Endpoints:** `POST /api/auth/login`

---

### US-002: Logout
**Como** admin  
**Quero** sair do sistema  
**Para** encerrar minha sessão de forma segura

**Critérios de Aceite:**
- [ ] Botão de logout visível no header
- [ ] Limpar dados do localStorage
- [ ] Redirecionar para `/login`
- [ ] Não permitir voltar para rotas protegidas

---

### US-003: Proteção de Rotas
**Como** sistema  
**Quero** proteger rotas administrativas  
**Para** impedir acesso não autorizado

**Critérios de Aceite:**
- [ ] Redirecionar para `/login` se não houver token
- [ ] Redirecionar para `/login` se token expirado (401)
- [ ] Manter usuário logado enquanto token válido

---

## E2: Dashboard

### US-004: Visualizar KPIs
**Como** admin  
**Quero** ver indicadores principais ao acessar o painel  
**Para** ter visão rápida do status da plataforma

**Critérios de Aceite:**
- [ ] Card: Total de Bots ativos
- [ ] Card: Número de transações
- [ ] Card: Receita total (R$)
- [ ] Card: Taxa de sucesso (%)
- [ ] Loading skeleton durante carregamento
- [ ] Mensagem de erro se API falhar

**Endpoints:** `GET /api/dashboard/stats`

---

### US-005: Listar Bots no Dashboard
**Como** admin  
**Quero** ver tabela resumida dos meus bots  
**Para** acompanhar status rapidamente

**Critérios de Aceite:**
- [ ] Exibir nome, status, transações, receita
- [ ] Link para página de detalhes
- [ ] Estado vazio: "Nenhum bot criado"

**Endpoints:** `GET /api/bots`

---

### US-006: Ver Top Bots por Receita
**Como** admin  
**Quero** ver ranking dos bots mais rentáveis  
**Para** identificar melhores performers

**Critérios de Aceite:**
- [ ] Lista ordenada por receita (desc)
- [ ] Exibir posição, nome e valor
- [ ] Máximo 5 bots

---

## E3: Gerenciamento de Bots

### US-007: Listar Todos os Bots
**Como** admin  
**Quero** ver todos os bots cadastrados  
**Para** gerenciar a plataforma

**Critérios de Aceite:**
- [ ] Grid de cards com informações do bot
- [ ] Exibir: nome, owner, @telegram, status
- [ ] Exibir: transações, receita, split
- [ ] Loading durante carregamento

**Endpoints:** `GET /api/bots`

---

### US-008: Buscar Bots
**Como** admin  
**Quero** buscar bots por nome, owner ou @telegram  
**Para** encontrar bots específicos rapidamente

**Critérios de Aceite:**
- [ ] Campo de busca no topo
- [ ] Filtrar em tempo real (client-side)
- [ ] Destacar termo buscado

---

### US-009: Filtrar Bots por Status
**Como** admin  
**Quero** filtrar bots por status  
**Para** focar em bots ativos ou inativos

**Critérios de Aceite:**
- [ ] Tabs: Todos, Ativos, Inativos
- [ ] Contador em cada tab
- [ ] Manter filtro ao navegar

**Endpoints:** `GET /api/bots?status=active`

---

### US-010: Criar Novo Bot
**Como** admin  
**Quero** criar um novo bot para um logista  
**Para** habilitar recebimento de pagamentos

**Critérios de Aceite:**
- [ ] Botão "Criar Novo Bot" abre modal
- [ ] Campos: nome, token Telegram, owner, endereço Depix
- [ ] Campo opcional: taxa customizada
- [ ] Validar formato do token
- [ ] Validar token com Telegram API
- [ ] Erro se token já existe
- [ ] Fechar modal e atualizar lista após sucesso

**Endpoints:** `POST /api/bots`

---

### US-011: Ver Detalhes do Bot
**Como** admin  
**Quero** ver informações completas de um bot  
**Para** analisar performance detalhada

**Critérios de Aceite:**
- [ ] Página dedicada `/bots/:id`
- [ ] Header: nome, status, @telegram, criado em
- [ ] Stats: receita dia, semana, mês
- [ ] Dados do logista: nome, endereço Depix
- [ ] Lista das últimas 20 transações
- [ ] QR Code link do bot

**Endpoints:** `GET /api/bots/:id`

---

### US-012: Editar Bot
**Como** admin  
**Quero** editar informações de um bot  
**Para** atualizar dados ou taxa

**Critérios de Aceite:**
- [ ] Botão "Manage" abre modal de edição
- [ ] Campos editáveis: nome, owner, depix address, taxa
- [ ] Não permitir editar token
- [ ] Confirmar alterações
- [ ] Atualizar card após salvar

**Endpoints:** `PATCH /api/bots/:id`

---

### US-013: Alternar Status do Bot
**Como** admin  
**Quero** ativar ou desativar um bot  
**Para** pausar operações temporariamente

**Critérios de Aceite:**
- [ ] Toggle ou switch de status
- [ ] Confirmar ação
- [ ] Bot desativado para de responder no Telegram
- [ ] Atualizar badge de status

**Endpoints:** `PATCH /api/bots/:id` (status)

---

### US-014: Excluir Bot
**Como** admin  
**Quero** remover um bot do sistema  
**Para** limpar bots desnecessários

**Critérios de Aceite:**
- [ ] Confirmação antes de excluir
- [ ] Soft delete (marca como deletado)
- [ ] Histórico de transações mantido
- [ ] Remover da lista após exclusão

**Endpoints:** `DELETE /api/bots/:id`

---

## E4: Transações

### US-015: Listar Transações
**Como** admin  
**Quero** ver histórico de todas as transações  
**Para** acompanhar pagamentos

**Critérios de Aceite:**
- [ ] Tabela com: ID, bot, cliente, valor, split, status, data
- [ ] Ordenar por data (mais recente primeiro)
- [ ] Loading durante carregamento

**Endpoints:** `GET /api/transactions`

---

### US-016: Buscar Transações
**Como** admin  
**Quero** buscar transações por ID, bot ou cliente  
**Para** localizar pagamentos específicos

**Critérios de Aceite:**
- [ ] Campo de busca
- [ ] Buscar em: ID, nome do bot, nome do cliente
- [ ] Resultados em tempo real ou ao submit

**Endpoints:** `GET /api/transactions?search=`

---

### US-017: Filtrar Transações por Status
**Como** admin  
**Quero** filtrar transações por status  
**Para** focar em pendentes ou problemas

**Critérios de Aceite:**
- [ ] Filtros: Todos, Concluído, Processando, Falhou
- [ ] Aplicar filtro imediatamente
- [ ] Exibir contador por status

**Endpoints:** `GET /api/transactions?status=`

---

### US-018: Filtrar Transações por Data
**Como** admin  
**Quero** filtrar transações por período  
**Para** analisar períodos específicos

**Critérios de Aceite:**
- [ ] Seletor de data inicial
- [ ] Seletor de data final
- [ ] Validar intervalo (início <= fim)

**Endpoints:** `GET /api/transactions?dateFrom=&dateTo=`

---

### US-019: Paginar Transações
**Como** admin  
**Quero** navegar entre páginas de transações  
**Para** não sobrecarregar a tela

**Critérios de Aceite:**
- [ ] Exibir 20 itens por página
- [ ] Indicador de página atual
- [ ] Botões: Anterior, Próximo
- [ ] Exibir total de itens e páginas

**Endpoints:** `GET /api/transactions?page=&limit=`

---

### US-020: Ver Detalhes da Transação
**Como** admin  
**Quero** ver informações completas de uma transação  
**Para** investigar problemas ou verificar dados

**Critérios de Aceite:**
- [ ] Página ou modal dedicado
- [ ] Exibir todos os campos
- [ ] Link para o bot relacionado
- [ ] Link para transação na blockchain (se aplicável)

**Endpoints:** `GET /api/transactions/:id`

---

### US-021: Exportar Transações
**Como** admin  
**Quero** exportar transações para CSV  
**Para** análises externas ou contabilidade

**Critérios de Aceite:**
- [ ] Botão "Exportar Dados"
- [ ] Respeitar filtros ativos
- [ ] Download automático do arquivo
- [ ] Nome: transactions_YYYY-MM-DD.csv

**Endpoints:** `GET /api/transactions/export`

---

## E5: Configurações

### US-022: Visualizar Configurações
**Como** admin  
**Quero** ver configurações atuais da plataforma  
**Para** saber como o sistema está configurado

**Critérios de Aceite:**
- [ ] Página `/configuracoes`
- [ ] Seções organizadas
- [ ] Campos preenchidos com valores atuais

**Endpoints:** `GET /api/settings`

---

### US-023: Configurar Taxa da Plataforma
**Como** admin  
**Quero** definir a taxa cobrada nos pagamentos  
**Para** controlar margem de lucro

**Critérios de Aceite:**
- [ ] Campo: Taxa padrão (%)
- [ ] Campo: Taxa mínima permitida
- [ ] Campo: Taxa máxima permitida
- [ ] Validação de limites

**Endpoints:** `PUT /api/settings`

---

### US-024: Configurar Integração Depix
**Como** admin  
**Quero** configurar credenciais da API Depix  
**Para** habilitar processamento de pagamentos

**Critérios de Aceite:**
- [ ] Campo: API URL
- [ ] Campo: API Key (oculto)
- [ ] Campo: Webhook Secret (oculto)
- [ ] Botão: Testar Conexão
- [ ] Badge de status: Conectado/Erro

**Endpoints:** `PUT /api/settings`, `POST /api/settings/test-depix`

---

### US-025: Configurar Integração Telegram
**Como** admin  
**Quero** autenticar conta Telegram (MTProto)  
**Para** criar e gerenciar bots

**Critérios de Aceite:**
- [ ] Campo: API ID
- [ ] Campo: API Hash
- [ ] Campo: Número de telefone
- [ ] Fluxo de autenticação com código SMS
- [ ] Badge de status: Conectado/Desconectado

**Endpoints:** `POST /api/settings/telegram/auth`

---

### US-026: Alterar Dados da Conta
**Como** admin  
**Quero** atualizar meu nome e senha  
**Para** manter dados atualizados

**Critérios de Aceite:**
- [ ] Campo: Nome
- [ ] Campo: Email (readonly)
- [ ] Campos: Senha atual, nova senha, confirmar
- [ ] Validação de senha forte
- [ ] Confirmar senha atual para alterar

**Endpoints:** `PUT /api/settings/account`

---

### US-027: Configurar Notificações
**Como** admin  
**Quero** definir preferências de notificação  
**Para** receber alertas importantes

**Critérios de Aceite:**
- [ ] Toggle: Notificações por email
- [ ] Toggle: Alertas no Telegram
- [ ] Campo: Valor mínimo para notificar

**Endpoints:** `PUT /api/settings`

---

## E6: Bot Telegram (Logista)

### US-028: Iniciar Bot
**Como** logista  
**Quero** iniciar o bot com /start  
**Para** começar a usar o sistema

**Critérios de Aceite:**
- [ ] Mensagem de boas-vindas
- [ ] Exibir menu principal (keyboard)
- [ ] Validar se bot está ativo

---

### US-029: Selecionar Valor Pré-definido
**Como** logista  
**Quero** escolher valores rápidos de pagamento  
**Para** agilizar vendas comuns

**Critérios de Aceite:**
- [ ] Keyboard com valores: R$50, R$150, R$200, R$300, R$500, R$1000
- [ ] Gerar PIX imediatamente ao clicar

---

### US-030: Informar Valor Personalizado
**Como** logista  
**Quero** digitar um valor customizado  
**Para** vendas com valores específicos

**Critérios de Aceite:**
- [ ] Opção "Valor Personalizado"
- [ ] Validar formato numérico
- [ ] Validar valor mínimo (R$ 1,00)

---

### US-031: Receber QR Code PIX
**Como** logista  
**Quero** receber QR Code e copia/cola  
**Para** mostrar ao cliente

**Critérios de Aceite:**
- [ ] Exibir imagem do QR Code
- [ ] Exibir código copia/cola
- [ ] Informar tempo de expiração

---

### US-032: Receber Confirmação de Pagamento
**Como** logista  
**Quero** ser notificado quando o cliente pagar  
**Para** concluir a venda

**Critérios de Aceite:**
- [ ] Mensagem de confirmação automática
- [ ] Exibir valor recebido
- [ ] Exibir split (quanto fica com o logista)

---

### US-033: Ver Último Pagamento
**Como** logista  
**Quero** ver detalhes do último pagamento  
**Para** conferir valores

**Critérios de Aceite:**
- [ ] Comando /ultimo ou botão no keyboard
- [ ] Exibir: valor, data, status

---

## Matriz de Rastreabilidade

| User Story | Página | Endpoint | Componente |
|------------|--------|----------|------------|
| US-001 | Login | POST /auth/login | Login.tsx |
| US-002 | Layout | - | Layout.tsx |
| US-003 | - | - | ProtectedRoute.tsx |
| US-004 | Dashboard | GET /dashboard/stats | StatsCard.tsx |
| US-005 | Dashboard | GET /bots | BotsTable.tsx |
| US-006 | Dashboard | GET /dashboard/stats | TopBotsList.tsx |
| US-007 | Bots | GET /bots | BotGrid.tsx |
| US-008 | Bots | - | SearchInput.tsx |
| US-009 | Bots | GET /bots?status= | FilterTabs.tsx |
| US-010 | Bots | POST /bots | CreateBotModal.tsx |
| US-011 | BotDetails | GET /bots/:id | BotDetails.tsx |
| US-012 | Bots | PATCH /bots/:id | EditBotModal.tsx |
| US-013 | Bots | PATCH /bots/:id | BotCard.tsx |
| US-014 | Bots | DELETE /bots/:id | BotCard.tsx |
| US-015 | Transações | GET /transactions | TransactionTable.tsx |
| US-016 | Transações | GET /transactions?search= | SearchInput.tsx |
| US-017 | Transações | GET /transactions?status= | FilterTabs.tsx |
| US-018 | Transações | GET /transactions?date= | TransactionFilters.tsx |
| US-019 | Transações | GET /transactions?page= | Pagination.tsx |
| US-020 | TransactionDetails | GET /transactions/:id | TransactionDetails.tsx |
| US-021 | Transações | GET /transactions/export | ExportButton.tsx |
| US-022 | Configurações | GET /settings | Settings.tsx |
| US-023 | Configurações | PUT /settings | PlatformSection.tsx |
| US-024 | Configurações | PUT /settings | DepixSection.tsx |
| US-025 | Configurações | POST /settings/telegram/auth | TelegramSection.tsx |
| US-026 | Configurações | PUT /settings/account | AccountSection.tsx |
| US-027 | Configurações | PUT /settings | NotificationsSection.tsx |
| US-028-033 | - | Telegram Bot | telegram/handlers/ |

---

## Priorização MoSCoW

### Must Have (MVP)
- US-001, US-002, US-003 (Auth)
- US-004, US-005 (Dashboard básico)
- US-007, US-010, US-013 (Bots CRUD básico)
- US-015, US-017 (Transações listagem)
- US-024 (Depix config)
- US-028-032 (Bot Telegram core)

### Should Have
- US-006, US-008, US-009 (Dashboard/filtros)
- US-011, US-012, US-014 (Bots completo)
- US-016, US-018, US-019 (Transações filtros)
- US-023, US-025 (Configurações)

### Could Have
- US-020, US-021 (Detalhes/export)
- US-026, US-027 (Conta/notificações)
- US-033 (Bot extras)

### Won't Have (v1)
- Multi-admin
- Dashboard em tempo real (websockets)
- App mobile
