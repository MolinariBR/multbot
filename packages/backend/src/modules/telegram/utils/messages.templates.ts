const statusEmojiByPaymentStatus: Record<string, string> = {
    completed: '✅',
    processing: '⏳',
    failed: '❌',
};

const defaultErrorMessage = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';

export type PaymentStatusItem = {
    id: string;
    amount: string;
    status: string;
    statusLabel?: string;
    date: string;
};

function getStatusEmoji(status: string): string {
    return statusEmojiByPaymentStatus[status] ?? '❓';
}

function buildEmptyPaymentStatusMessage(): string {
    return `
📊 *Meus Pagamentos*

Você ainda não realizou nenhum pagamento.

Use /pagar para fazer seu primeiro pagamento!
    `.trim();
}

function buildPaymentStatusList(payments: PaymentStatusItem[]): string {
    return payments.map((payment, index) => (
        `${index + 1}. ${payment.amount} - `
        + `${getStatusEmoji(payment.status)} ${payment.statusLabel ?? payment.status}`
        + `\n   ${payment.date} | ID: \`${payment.id}\``
    )).join('\n\n');
}

export const messages = {
    welcome: (botName: string) => `
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

    about: (botName: string, ownerName: string) => `
ℹ️ *Sobre - ${botName}*

Sistema de pagamentos via PIX integrado com Liquid Network (Bitcoin).

*Proprietário:* ${ownerName}
*Tecnologia:* Depix API
*Rede:* Liquid Network

Pagamentos rápidos, seguros e com confirmação automática.
    `.trim(),

    paymentInitiated: () => `
💰 *Iniciar Pagamento*

Escolha um valor abaixo ou selecione "Outro valor" para digitar um valor customizado:
    `.trim(),

    customAmount: () => `
💵 *Valor Customizado*

Digite o valor que deseja pagar em R$.

Exemplos: 100, 150.50, 200,00
    `.trim(),

    paymentGenerated: (amountBrl: string, pixKey: string, expiresAt: string) => `
✅ *Pagamento Gerado*

💰 Valor: *${amountBrl}*
⏰ Expira em: ${expiresAt}

📋 *PIX Copia e Cola:*
\`${pixKey}\`

👆 Toque para copiar ou escaneie o QR Code acima.

_Aguardando confirmação do pagamento..._
    `.trim(),

    paymentConfirmed: (amountBrl: string, transactionId: string) => `
🎉 *Pagamento Confirmado!*

✅ Valor: *${amountBrl}*
🆔 ID: \`${transactionId}\`

Obrigado! Seu pagamento foi processado com sucesso.
    `.trim(),

    paymentCancelled: () => `
❌ *Pagamento Cancelado*

Use /pagar para iniciar um novo pagamento.
    `.trim(),

    paymentExpired: () => `
⏰ *Pagamento Expirado*

O tempo para pagamento expirou. Use /pagar para gerar um novo QR Code.
    `.trim(),

    error: (message?: string) => `
❌ *Erro*

${message || defaultErrorMessage}

Se o problema persistir, entre em contato com o suporte.
    `.trim(),

    paymentStatus: (payments: PaymentStatusItem[] = []) => {
        if (payments.length === 0) {
            return buildEmptyPaymentStatusMessage();
        }

        const paymentsList = buildPaymentStatusList(payments);

        return `
📊 *Meus Pagamentos*

${paymentsList}

Total: ${payments.length} pagamento(s)
        `.trim();
    },

    processing: () => `
⏳ *Processando...*

Aguarde um momento enquanto processamos sua solicitação.
    `.trim(),

    invalidAmount: () => `
❌ *Valor Inválido*

Por favor, digite um valor válido em R$.

Exemplos: 100, 150.50, 200,00
    `.trim(),

    mainMenu: () => `
🏠 *Menu Principal*

Use os botões abaixo para navegar:
    `.trim(),
};
