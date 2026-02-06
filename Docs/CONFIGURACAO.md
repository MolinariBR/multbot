# 🔧 Guia de Configuração - MultBot

## 📋 Pré-requisitos

Antes de iniciar, você precisará:

1. ✅ **Bot Telegram** criado via @BotFather
2. ⏳ **Credenciais Depix API** (API Key e URL)
3. ✅ **Endereço Liquid Network** para receber pagamentos

---

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Edite o arquivo `/packages/backend/.env`:

```bash
# Servidor
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Banco de Dados
DATABASE_URL=file:./prisma/dev.db

# Admin Padrão (para seed)
ADMIN_EMAIL=admin@multbot.com
ADMIN_PASSWORD=senha-segura-aqui
ADMIN_NAME=Administrador

# Depix API (CONFIGURAR QUANDO DISPONÍVEL)
DEPIX_API_URL=https://api.depix.com.br
DEPIX_API_KEY=sua-api-key-aqui
DEPIX_WEBHOOK_SECRET=seu-webhook-secret-aqui
```

### 2. Inicializar Banco de Dados

```bash
cd packages/backend
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

### 3. Iniciar Aplicação

```bash
# Na raiz do projeto
pnpm dev
```

Isso iniciará:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

---

## 🤖 Configurar Bot Telegram

### Opção 1: Via Interface Web

1. Acesse http://localhost:5173
2. Faça login com as credenciais do admin
3. Vá em "Gerenciar Bots"
4. Clique em "Novo Bot"
5. Preencha:
   - **Nome**: Nome do seu bot
   - **Token Telegram**: Token do @BotFather
   - **Proprietário**: Seu nome
   - **Endereço Depix**: Seu endereço Liquid
   - **Taxa**: Percentual da plataforma (padrão: 10%)

### Opção 2: Via Banco de Dados

```bash
cd packages/backend
sqlite3 prisma/dev.db

INSERT INTO Bot (
    id, name, telegramToken, telegramUsername, 
    ownerName, depixAddress, splitRate, status
) VALUES (
    'bot-id-unico',
    'Meu Bot',
    '8374587252:AAGsF-4eLbTZxCOMisoTzutKWAcbcGsoCQQ',
    '@seu_bot',
    'Seu Nome',
    'VJL...',
    0.10,
    'active'
);
```

---

## 💰 Configurar Depix API

### Quando Receber as Credenciais:

1. **Atualize o `.env`**:
```bash
DEPIX_API_URL=https://api.depix.com.br
DEPIX_API_KEY=sua-chave-real-aqui
DEPIX_WEBHOOK_SECRET=seu-secret-real-aqui
```

2. **Configure via Interface Web**:
   - Acesse http://localhost:5173/configuracoes
   - Preencha os campos Depix
   - Clique em "Testar Conexão"
   - Salve as configurações

3. **Reinicie o servidor**:
```bash
# Pare o servidor (Ctrl+C)
pnpm dev
```

### Configurar Webhook Depix

Configure o webhook na plataforma Depix para apontar para:

```
https://seu-dominio.com/api/depix/webhook
```

**Importante**: Em desenvolvimento, use ngrok ou similar:
```bash
ngrok http 3000
# Use a URL gerada: https://abc123.ngrok.io/api/depix/webhook
```

---

## 🧪 Testar Fluxo de Pagamento

### 1. Teste Manual no Telegram

1. Abra o Telegram
2. Procure seu bot: `@seu_bot`
3. Envie `/start`
4. Clique em "💰 Fazer Pagamento"
5. Selecione um valor (ex: R$ 10,00)
6. Aguarde o QR Code

**Com Depix Configurado**:
- QR Code real será gerado
- Pague via PIX
- Receberá confirmação automática

**Sem Depix (Mock)**:
- Verá mensagem de processamento
- Não gerará QR Code real

### 2. Verificar Logs

```bash
# Terminal do backend
✅ Bot MultBot Store (@seu_bot) inicializado
🚀 Servidor rodando em http://0.0.0.0:3000

# Ao fazer pagamento:
✅ Pagamento criado: cmla... - R$ 10,00
📥 Webhook Depix recebido: {...}
✅ Transação cmla... atualizada: completed
✅ Pagamento confirmado: cmla...
```

### 3. Verificar no Dashboard

- Acesse http://localhost:5173/painel
- Veja estatísticas atualizadas
- Verifique transações em "Histórico"

---

## 🔍 Troubleshooting

### Bot não responde

```bash
# Verificar se o bot está rodando
curl http://localhost:3000/api/bots

# Verificar logs do servidor
# Procure por: "✅ Bot ... inicializado"
```

### Erro de porta em uso

```bash
# Matar processos na porta 3000
lsof -ti:3000 | xargs kill -9

# Reiniciar
pnpm dev
```

### Depix retorna erro 401

- Verifique se `DEPIX_API_KEY` está correto
- Teste a conexão via interface web
- Verifique se a API está ativa

### QR Code não é gerado

- Verifique se `qrcode` está instalado:
  ```bash
  cd packages/backend
  pnpm list qrcode
  ```
- Verifique logs de erro no console

---

## 📊 Monitoramento

### Logs do Sistema

```bash
# Backend
cd packages/backend
tail -f logs/app.log  # Se configurado

# Ou acompanhe o terminal
pnpm dev
```

### Banco de Dados

```bash
cd packages/backend
sqlite3 prisma/dev.db

# Ver bots
SELECT * FROM Bot;

# Ver transações
SELECT * FROM Transaction ORDER BY createdAt DESC LIMIT 10;

# Ver estatísticas
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
    SUM(amountBrl) as total_amount
FROM Transaction;
```

### Prisma Studio

```bash
cd packages/backend
npx prisma studio
```

Acesse: http://localhost:5555

---

## 🔐 Segurança

### Produção

1. **Altere JWT_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

2. **Use HTTPS**:
   - Configure SSL/TLS
   - Use reverse proxy (nginx)

3. **Proteja Webhook**:
   - Valide `DEPIX_WEBHOOK_SECRET`
   - Use IP whitelist se possível

4. **Variáveis de Ambiente**:
   - Nunca commite `.env`
   - Use secrets manager em produção

---

## 📚 Próximos Passos

1. ✅ Configurar Depix API
2. ⏳ Testar pagamentos reais
3. ⏳ Configurar domínio e SSL
4. ⏳ Deploy em produção
5. ⏳ Monitoramento e alertas

---

## 🆘 Suporte

- **Documentação**: `/Docs`
- **Issues**: GitHub Issues
- **Logs**: Verifique sempre os logs do backend

---

**Status Atual**: ✅ Sistema 100% funcional, aguardando credenciais Depix para pagamentos reais.
