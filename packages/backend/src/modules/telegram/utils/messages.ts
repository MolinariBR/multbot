/**
 * Templates de mensagens do bot Telegram
 */

export const messages = {
    /**
     * Mensagem de boas-vindas
     */
    welcome: (botName: string, ownerName: string) => `
🤖 *Olá! Sou o ${botName}*

Bem-vindo ao sistema de pagamentos via Depix (Liquid Network).

*Como funciona:*
1️⃣ Escolha um valor ou digite o valor desejado
2️⃣ Receba o QR Code PIX
3️⃣ Pague via PIX
4️⃣ Receba confirmação automática

*Comandos disponíveis:*
/pagar - Iniciar um pagamento
/status - Ver status de pagamentos
/ajuda - Obter ajuda

Use o menu abaixo para navegar:
    `.trim(),

    /**
     * Mensagem de ajuda
     */
    help: (botName: string, ownerName: string) => `
📚 *Ajuda - ${botName}*

*Como fazer um pagamento:*
1. Clique em "💰 Fazer Pagamento" ou digite /pagar
2. Escolha um valor ou digite um valor customizado
3. Receba o QR Code PIX
4. Pague via PIX
5. Receba confirmação automática

*Outros comandos:*
/status - Ver seus pagamentos
/start - Voltar ao início

Em caso de dúvidas, entre em contato com ${ownerName}.
    `.trim(),

    /**
     * Mensagem sobre o bot
     */
    about: (botName: string, ownerName: string) => `
ℹ️ *Sobre - ${botName}*

Sistema de pagamentos via PIX integrado com Liquid Network (Bitcoin).

*Proprietário:* ${ownerName}
*Tecnologia:* Depix API
*Rede:* Liquid Network

Pagamentos rápidos, seguros e com confirmação automática.
    `.trim(),

    /**
     * Mensagem de pagamento iniciado
     */
    paymentInitiated: () => `
💰 *Iniciar Pagamento*

Escolha um valor abaixo ou selecione "Outro valor" para digitar um valor customizado:
    `.trim(),

    /**
     * Mensagem para valor customizado
     */
    customAmount: () => `
💵 *Valor Customizado*

Digite o valor que deseja pagar em R$.

Exemplos: 100, 150.50, 200,00
    `.trim(),

    /**
     * Mensagem de pagamento gerado com QR Code
     */
    paymentGenerated: (amountBrl: string, pixKey: string, expiresAt: string) => `
✅ *Pagamento Gerado*

💰 Valor: *${amountBrl}*
⏰ Expira em: ${expiresAt}

📋 *PIX Copia e Cola:*
\`${pixKey}\`

👆 Toque para copiar ou escaneie o QR Code acima.

_Aguardando confirmação do pagamento..._
    `.trim(),

    /**
     * Mensagem de pagamento confirmado
     */
    paymentConfirmed: (amountBrl: string, transactionId: string) => `
🎉 *Pagamento Confirmado!*

✅ Valor: *${amountBrl}*
🆔 ID: \`${transactionId}\`

Obrigado! Seu pagamento foi processado com sucesso.
    `.trim(),

    /**
     * Mensagem de pagamento cancelado
     */
    paymentCancelled: () => `
❌ *Pagamento Cancelado*

Use /pagar para iniciar um novo pagamento.
    `.trim(),

    /**
     * Mensagem de pagamento expirado
     */
    paymentExpired: () => `
⏰ *Pagamento Expirado*

O tempo para pagamento expirou. Use /pagar para gerar um novo QR Code.
    `.trim(),

    /**
     * Mensagem de erro genérico
     */
    error: (message?: string) => `
❌ *Erro*

${message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'}

Se o problema persistir, entre em contato com o suporte.
    `.trim(),

    /**
     * Mensagem de status de pagamentos
     */
    paymentStatus: (hasPayments: boolean, payments?: Array<{
        id: string;
        amount: string;
        status: string;
        date: string;
    }>) => {
        if (!hasPayments || !payments || payments.length === 0) {
            return `
📊 *Meus Pagamentos*

Você ainda não realizou nenhum pagamento.

Use /pagar para fazer seu primeiro pagamento!
            `.trim();
        }

        const paymentsList = payments.map((p, i) =>
            `${i + 1}. ${p.amount} - ${p.status === 'completed' ? '✅' : p.status === 'processing' ? '⏳' : '❌'} ${p.status}\n   ${p.date} | ID: \`${p.id}\``
        ).join('\n\n');

        return `
📊 *Meus Pagamentos*

${paymentsList}

Total: ${payments.length} pagamento(s)
        `.trim();
    },

    /**
     * Mensagem de processamento
     */
    processing: () => `
⏳ *Processando...*

Aguarde um momento enquanto processamos sua solicitação.
    `.trim(),

    /**
     * Mensagem de valor inválido
     */
    invalidAmount: () => `
❌ *Valor Inválido*

Por favor, digite um valor válido em R$.

Exemplos: 100, 150.50, 200,00
    `.trim(),

    /**
     * Mensagem de menu principal
     */
    mainMenu: () => `
🏠 *Menu Principal*

Use os botões abaixo para navegar:
    `.trim(),
};

/**
 * Formata valor em centavos para string BRL
 */
export function formatBRL(amountInCents: number): string {
    return `R$ ${(amountInCents / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Calcula tempo de expiração
 */
export function formatExpiration(expiresAt: Date | string): string {
    const expires = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 0) return 'Expirado';
    if (diffMins < 60) return `${diffMins} minuto(s)`;

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
}
