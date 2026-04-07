#!/bin/bash

# ============================================
# MultBot - Configuração SSL Automatizada
# Domínio: mullttibot.duckdns.org
# ============================================

DOMAIN="mullttibot.duckdns.org"
EMAIL="admin@test.com" # Email para renovação (pode ser fictício se não quiser receber alertas)

echo "🔒 Iniciando configuração HTTPS para $DOMAIN..."

# 1. Instalar Certbot e plugin Nginx
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Configurar Nginx com o domínio correto
echo "⚙️  Atualizando configuração do Nginx..."
CONFIG_FILE="/etc/nginx/sites-available/multbot"

if [ -f "$CONFIG_FILE" ]; then
    # Substitui 'server_name _;' ou qualquer outro server_name pelo domínio correto
    sudo sed -i "s/server_name .*;/server_name $DOMAIN;/g" $CONFIG_FILE
    echo "✅ Server name atualizado para $DOMAIN"
else
    echo "❌ Arquivo de configuração do Nginx não encontrado em $CONFIG_FILE"
    exit 1
fi

# 3. Recarregar Nginx para aplicar o nome do servidor
sudo systemctl reload nginx

# 4. Obter e instalar Certificado SSL
echo "🔐 Solicitando certificado SSL (Let's Encrypt)..."
if sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
    echo ""
    echo "✅ HTTPS Configurado com Sucesso!"
    echo "🌐 Acesse agora: https://$DOMAIN"
    echo "🔗 Webhook URL: https://$DOMAIN/api/depix/webhook"
else
    echo ""
    echo "❌ Falha ao configurar SSL. Verifique se o domínio aponta corretamente para este IP."
fi
