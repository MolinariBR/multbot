import type { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'node-telegram-bot-api';

/**
 * Keyboard principal com opções do menu
 */
export const mainKeyboard: ReplyKeyboardMarkup = {
    keyboard: [
        [
            { text: '💰 Fazer Pagamento' },
            { text: '📊 Meus Pagamentos' },
        ],
        [
            { text: '❓ Ajuda' },
            { text: 'ℹ️ Sobre' },
        ],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
};

/**
 * Keyboard inline para confirmação
 */
export function confirmationKeyboard(actionId: string): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: '✅ Confirmar', callback_data: `confirm_${actionId}` },
                { text: '❌ Cancelar', callback_data: `cancel_${actionId}` },
            ],
        ],
    };
}

/**
 * Keyboard inline para voltar ao menu
 */
export const backToMenuKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
        [
            { text: '🏠 Voltar ao Menu', callback_data: 'back_to_menu' },
        ],
    ],
};

/**
 * Remove keyboard (esconde teclado customizado)
 */
export const removeKeyboard = {
    remove_keyboard: true,
};
