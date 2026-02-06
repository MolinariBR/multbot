#!/bin/bash

# ============================================
# MultBot - Script de Deploy Automatizado
# Digital Ocean - Ubuntu 24.04 LTS
# ============================================

set -e  # Para o script se houver erro

echo "🚀 Iniciando deploy do MultBot..."

# ============================================
# 1. Atualizar Sistema
# ============================================
echo "📦 Atualizando sistema..."
sudo apt update
sudo apt upgrade -y

# ============================================
# 2. Instalar Node.js 20 LTS
# ============================================
echo "📦 Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ============================================
# 3. Instalar pnpm
# ============================================
echo "📦 Instalando pnpm..."
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

# ============================================
# 4. Instalar Nginx
# ============================================
echo "📦 Instalando Nginx..."
sudo apt install -y nginx

# ============================================
# 5. Instalar PM2 (Process Manager)
# ============================================
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# ============================================
# 6. Configurar Firewall
# ============================================
echo "🔒 Configurando firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# ============================================
# 7. Instalar Dependências do Projeto
# ============================================
echo "📦 Instalando dependências do projeto..."
cd /root/multbot
pnpm install

# ============================================
# 8. Configurar Backend
# ============================================
echo "⚙️  Configurando backend..."
cd /root/multbot/packages/backend

# Criar diretório para banco de dados
mkdir -p /var/multbot/data

# Gerar Prisma Client
pnpm prisma generate

# Criar banco de dados e rodar migrations
DATABASE_URL="file:/var/multbot/data/prod.db" pnpm prisma db push

# Rodar seed (criar admin padrão)
DATABASE_URL="file:/var/multbot/data/prod.db" pnpm prisma db seed

# Build do backend
pnpm build

# ============================================
# 9. Configurar Frontend
# ============================================
echo "⚙️  Configurando frontend..."
cd /root/multbot/packages/frontend

# Build do frontend (com API apontando para /api)
VITE_API_URL=/api pnpm build

# Copiar build para pasta do Nginx
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# ============================================
# 10. Configurar Nginx
# ============================================
echo "⚙️  Configurando Nginx..."
sudo tee /etc/nginx/sites-available/multbot > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Pass client IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar configuração
sudo ln -sf /etc/nginx/sites-available/multbot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# ============================================
# 11. Criar arquivo .env para produção
# ============================================
echo "⚙️  Criando arquivo .env..."
cd /root/multbot/packages/backend

cat > .env <<EOF
# Servidor
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# JWT (ALTERE ESTE SECRET!)
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRES_IN=24h

# Banco de Dados
DATABASE_URL=file:/var/multbot/data/prod.db

# Depix API (Configure quando tiver as credenciais)
DEPIX_API_URL=https://api.depix.com.br
DEPIX_API_KEY=sua-api-key-aqui
DEPIX_WEBHOOK_SECRET=seu-webhook-secret-aqui
EOF

# ============================================
# 12. Iniciar Backend com PM2
# ============================================
echo "🚀 Iniciando backend com PM2..."
cd /root/multbot/packages/backend

# Parar processo anterior se existir
pm2 delete multbot-backend 2>/dev/null || true

# Iniciar backend
pm2 start dist/index.js --name multbot-backend

# Configurar PM2 para iniciar no boot
pm2 startup systemd -u root --hp /root
pm2 save

# ============================================
# 13. Verificar Status
# ============================================
echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status dos serviços:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo systemctl status nginx --no-pager | head -3
pm2 status
echo ""
echo "🌐 Acesse sua aplicação em: http://$(curl -s ifconfig.me)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Altere o JWT_SECRET em /root/multbot/packages/backend/.env"
echo "2. Configure as credenciais Depix no mesmo arquivo"
echo "3. Reinicie o backend: pm2 restart multbot-backend"
echo ""
echo "📝 Comandos úteis:"
echo "  - Ver logs: pm2 logs multbot-backend"
echo "  - Reiniciar: pm2 restart multbot-backend"
echo "  - Parar: pm2 stop multbot-backend"
echo "  - Status: pm2 status"
echo ""
