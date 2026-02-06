# SISTEMA PDV MULTI BOT TELEGRAM

## DESCRIÇÃO
Multi Bot é um app web para gestão de mult bots (logistas). A ideia é que atraves desse app seja possivel criar bots via interface web ja desenvolvida e presente em: packages/frontend. Para cada logista que irá usar o DEPIX como forma de recebimento de pagamentos.

No fluxo cada cliente final do logista, paga pix normalmente, mas o logista recebe DEPIX em sua carteira sideswap ou aqua atravez de split de pagamento da DEPIX. Dessa forma, durante o split o logista recebe o valor e a plataforma fica com a taxa pelo serviço.

No fluxo de criação do bot via plataforma é informado o endereço Depix de cada logista. Cada bot é um logista independente dos demais bots/logistas.

## STACK TECNOLOGICA

### Frontend

| Categoria | Tecnologia | Versão |
|-----------|-----------|---------|
| **Runtime** | Node.js | v18+ (inferido) |
| **Framework Frontend** | React | 18.3.1 |
| **Linguagem** | TypeScript | 5.5.3 |
| **Build Tool** | Vite | 5.4.21 |
| **Roteamento** | React Router | 6.30.3 |
| **Styling** | Tailwind CSS + PostCSS | 3.4.17 |
| **Notificações** | React Hot Toast | 2.5.2 |
| **Animações** | Framer Motion | 12.23.11 |
| **Ícones** | Lucide React | 0.540.0 |
| **Backend SDK** | @lumi.new/sdk | 0.3.6 |
| **Linting** | ESLint | 9.9.1 |
| **Transpilador** | SWC (via Vite plugin) | 1.13.3 |

### Backend

1. Node.js.
2. Sqlite 3.
3. ORM Prisma.
4. OpenAPI 3.0.
5. OpenAPI Swagger.
6. Telegram Bot API.

### FUNÇÕES PRICIPAIS

1. Criar bot via UI usando o botão: Criar novo bot com o nome do logista.
2. Historico de todas as transações de todos os bots, via pagina: http://localhost:5173/transacoes
3. Ver detalhes do bot de cada logista via http://localhost:5173/bots. Clicando no botão View Details.
4. Gerenciar bot de cada logista via http://localhost:5173/bots. Clicando no botão Manage.
5. Status da Plataforma: Numero de Bots ativos, Volume Depix via card da sidebar.


### DETALHES POR PAGINA DO APP WEB

1. PAINEL (DASHBOARD: http://localhost:5173/painel)

* Exibe os cards principais: 
 - Volume Total (BRL)
 - Bots Telegram Ativos
 - Receita Split do Admin
 - Transações Ativas

* Bots com Melhor Desempenho
 - Nome do Bot
 - Transações
 - Receita
 - Split Admin
 - Status

* Recent Splits separdo por card para cada logista com:
 - Bot TechStore
 - Data e hora
 - Total
 - Merchant (90%)
 - Admin (10%)
 - Status: Completo, Em processo

2. Gerenciamento de Bots

* Botão que abre modal para Criar Novo Bot
* Campo de Busca e filtro simples por: Todos, Ativos, Inativos.
* Card para cada bot com:
 - Nome do Bot
 - Responsavel
 - @ do bot
 - Transações
 - Depix Balance
 - Revenue Split
 - Merchant (90%)
 - Admin (10%)
 - Botão de Detalhes do Bot
 - Botão de Gestão (Manage) do Bot
 - Badge: Ativo, Inativo.

3. Historico de Transações
 
 * Campo de Busca por: Id, Bot ou Logista.
 * Filtros:
  - Todos
  - Processando
  - Concluido
  - Falhou
 * Tabela exibindo todas as transações
  - ID da Transação
  - Bot / Cliente
  - Valor / Depix
  - Split de Pagamento
  - Status
  - Data / Hora
  - Ações: Detalhes

4. Configurações

 * Configurações da conta Telegram que cria bots.
 * Configurações de taxa do logista.
 * Configurações de Chaves, API KEY do Depix


## FLUXO MACRO DO PROJETO

Logista usa o seu bot para definir o valor.
Apos definir o valor e seu cliente final pagar via pix.
O processo depix começa.
O split é acionado e credita na carteira liquid do logista o valor.
Ainda no split o valor da porcentagem da plataforma fica retido, liberando o valor para o logista, descontado a tarifa (taxa).


## BOT LOGISTA FLUXO
Usando o telegram o logista usa o bot para:
 * Definir valor do pagamento.
 * Usa o ReplyKeyboardMarkup para definir o preço que será cobrado do seu cliente.
 * O ReplyKeyboardMarkup tem botoes de preço rapido vom valores predefinidos como: 50, 150, 200, 300 reais. Mas logo abaixo dos valores pre definidos aparece o teclado normal de 0 a 9 para valores customizados.
 * Quando o logista define o valor e envia, o bot telegram exibe o QRCODE e Chave Pix, Copia e cola. Cliente Paga e segue o fluxo.
