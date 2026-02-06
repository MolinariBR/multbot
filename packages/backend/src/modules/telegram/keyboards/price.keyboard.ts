import type { InlineKeyboardMarkup } from 'node-telegram-bot-api';

/**
 * Valores pré-definidos para pagamento rápido (em centavos)
 */
export const QUICK_PAYMENT_VALUES = [
    { label: 'R$ 10,00', value: 1000 },
    { label: 'R$ 25,00', value: 2500 },
    { label: 'R$ 50,00', value: 5000 },
    { label: 'R$ 100,00', value: 10000 },
    { label: 'R$ 250,00', value: 25000 },
    { label: 'R$ 500,00', value: 50000 },
];

/**
 * Keyboard com valores pré-definidos para pagamento
 */
export const priceKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
        [
            { text: 'R$ 10,00', callback_data: 'pay_1000' },
            { text: 'R$ 25,00', callback_data: 'pay_2500' },
        ],
        [
            { text: 'R$ 50,00', callback_data: 'pay_5000' },
            { text: 'R$ 100,00', callback_data: 'pay_10000' },
        ],
        [
            { text: 'R$ 250,00', callback_data: 'pay_25000' },
            { text: 'R$ 500,00', callback_data: 'pay_50000' },
        ],
        [
            { text: '💵 Outro valor', callback_data: 'pay_custom' },
        ],
        [
            { text: '❌ Cancelar', callback_data: 'cancel_payment' },
        ],
    ],
};

/**
 * Gera keyboard com valor customizado
 */
export function customPriceKeyboard(amountBrl: number): InlineKeyboardMarkup {
    const formatted = (amountBrl / 100).toFixed(2).replace('.', ',');

    return {
        inline_keyboard: [
            [
                {
                    text: `✅ Confirmar R$ ${formatted}`,
                    callback_data: `confirm_pay_${amountBrl}`
                },
            ],
            [
                { text: '❌ Cancelar', callback_data: 'cancel_payment' },
            ],
        ],
    };
}

/**
 * Keyboard para ações após pagamento gerado
 */
export function paymentActionsKeyboard(transactionId: string): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                {
                    text: '🔄 Verificar Status',
                    callback_data: `check_payment_${transactionId}`
                },
            ],
            [
                { text: '❌ Cancelar Pagamento', callback_data: `cancel_tx_${transactionId}` },
            ],
            [
                { text: '🏠 Menu Principal', callback_data: 'back_to_menu' },
            ],
        ],
    };
}

/**
 * Converte valor em centavos para string formatada
 */
export function formatPrice(amountInCents: number): string {
    return `R$ ${(amountInCents / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Converte string de preço para centavos
 * Aceita formatos: "100", "100.50", "100,50", "R$ 100,50"
 */
export function parsePrice(priceString: string): number | null {
    // Remove "R$", espaços e outros caracteres não numéricos exceto vírgula e ponto
    const cleaned = priceString.replace(/[^\d,\.]/g, '');

    // Substitui vírgula por ponto
    const normalized = cleaned.replace(',', '.');

    // Converte para número
    const value = parseFloat(normalized);

    if (isNaN(value) || value <= 0) {
        return null;
    }

    // Converte para centavos
    return Math.round(value * 100);
}
