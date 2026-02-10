# 🚀 Guia de Deploy - Digital Ocean

## Configuração do Droplet

- **Sistema Operacional**: Ubuntu 24.04 LTS x64
- **Plano**: Basic - Regular CPU
- **Recursos**: 2GB RAM / 1 CPU / 50GB SSD / 2TB Transfer
- **Custo**: $12/mês

---

## 📋 Passo a Passo

### 1. Criar o Droplet na Digital Ocean

1. Acesse o painel da Digital Ocean
2. Clique em "Create" → "Droplets"
3. Escolha:
   - **Image**: Ubuntu 24.04 LTS x64
   - **Plan**: Basic - Regular ($12/mês)
   - **Datacenter**: Escolha a região mais próxima (ex: São Paulo ou New York)
   - **Authentication**: SSH Key (recomendado) ou Password
4. Clique em "Create Droplet"
5. Anote o IP do droplet criado

### 2. Conectar ao Servidor

```bash
ssh root@SEU_IP_DO_DROPLET
```

### 3. Enviar o Código para o Servidor

**Opção A: Clonar do GitHub (Recomendado)**

No servidor, execute:

```bash
cd /root
git clone https://github.com/SEU_USUARIO/multbot.git
```

**Opção B: Copiar do seu computador via SCP**

No seu computador local (não no servidor), execute:

```bash
# Criar um arquivo tar.gz excluindo node_modules
tar -czf multbot.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='packages/backend/prisma/dev.db' \
  -C /home/mau/molinari multbot

# Enviar para o servidor
scp multbot.tar.gz root@SEU_IP_DO_DROPLET:/root/

# No servidor, descompactar
ssh root@SEU_IP_DO_DROPLET
cd /root
tar -xzf multbot.tar.gz
rm multbot.tar.gz
```

### 4. Executar o Script de Deploy

No servidor, execute:

```bash
cd /root/multbot
chmod +x deploy.sh
./deploy.sh
```

O script vai automaticamente:
- ✅ Instalar Node.js 20 LTS
- ✅ Instalar pnpm
- ✅ Instalar Nginx
- ✅ Instalar PM2
- ✅ Configurar firewall
- ✅ Instalar dependências do projeto
- ✅ Criar e configurar banco de dados SQLite
- ✅ Fazer build do backend e frontend
- ✅ Configurar Nginx como proxy reverso
- ✅ Iniciar backend com PM2

**Tempo estimado**: 5-10 minutos

### 5. Configurar Variáveis de Ambiente

Após o deploy, **IMPORTANTE** editar o arquivo `.env`:

```bash
nano /root/multbot/packages/backend/.env
```

Altere:
- `JWT_SECRET`: Gere uma chave segura (use `openssl rand -base64 32`)
- `DEPIX_API_KEY`: Sua chave da API Depix
- `DEPIX_WEBHOOK_SECRET`: Seu secret do webhook Depix

**Importante (Depix):**
- As credenciais da Depix também podem ser configuradas via API/painel em `GET/PUT /api/settings` (recomendado).
- Se você configurar por `.env`, reinicie o backend (`pm2 restart multbot-backend`) para aplicar.

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`

Reinicie o backend:

```bash
pm2 restart multbot-backend
```

### 6. Acessar a Aplicação

Acesse no navegador:

```
http://SEU_IP_DO_DROPLET
```

**Credenciais padrão** (definidas no seed):
- Email: `admin@multbot.com`
- Senha: A senha definida no `.env` do backend (variável `ADMIN_PASSWORD`)

---

## 🔧 Comandos Úteis

### Gerenciar Backend (PM2)

```bash
# Ver logs em tempo real
pm2 logs multbot-backend

# Ver status
pm2 status

# Reiniciar
pm2 restart multbot-backend

# Parar
pm2 stop multbot-backend

# Iniciar
pm2 start multbot-backend
```

### Gerenciar Nginx

```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
```

### Banco de Dados

```bash
cd /root/multbot/packages/backend

# Abrir Prisma Studio (interface visual)
npx prisma studio

# Acessar banco via CLI
sqlite3 /var/multbot/data/prod.db
```

### Atualizar Aplicação

Quando fizer mudanças no código:

```bash
cd /root/multbot

# Puxar atualizações do Git
git pull

# Reinstalar dependências (se necessário)
pnpm install

# Backend
cd packages/backend
pnpm build
pm2 restart multbot-backend

# Frontend
cd ../frontend
VITE_API_URL=/api pnpm build
sudo cp -r dist/* /var/www/html/
```

---

## 🔒 Configurar HTTPS (Opcional mas Recomendado)

Para ter SSL/TLS (cadeado verde), use o Certbot:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado (substitua seu-dominio.com)
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já está configurada
```

**Nota**: Você precisa ter um domínio apontando para o IP do droplet.

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
pm2 logs multbot-backend --lines 100

# Verificar se a porta 3000 está livre
sudo lsof -i :3000
```

### Frontend não carrega

```bash
# Verificar se Nginx está rodando
sudo systemctl status nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Banco de dados com erro

```bash
# Verificar permissões
ls -la /var/multbot/data/

# Recriar banco
cd /root/multbot/packages/backend
DATABASE_URL="file:/var/multbot/data/prod.db" pnpm prisma db push --force-reset
DATABASE_URL="file:/var/multbot/data/prod.db" pnpm prisma db seed
```

---

## 💰 Custos

- **Droplet**: $12/mês
- **Banco de dados**: $0 (SQLite local)
- **Total**: $12/mês

Dentro do limite do GitHub Student Pack! 🎓

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Processos
pm2 monit
```

### Configurar alertas (opcional)

```bash
# PM2 pode enviar alertas por email
pm2 install pm2-server-monit
```

---

## 🆘 Suporte

Se algo der errado:

1. Verifique os logs: `pm2 logs multbot-backend`
2. Verifique o Nginx: `sudo nginx -t`
3. Verifique o firewall: `sudo ufw status`
4. Reinicie tudo: `pm2 restart all && sudo systemctl restart nginx`
