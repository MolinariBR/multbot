import type {
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
} from 'node-telegram-bot-api';

const CALLBACK_ACTION_CONFIRM_PREFIX = 'confirm_';
const CALLBACK_ACTION_CANCEL_PREFIX = 'cancel_';
const CALLBACK_BACK_TO_MENU = 'back_to_menu';

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

export function confirmationKeyboard(actionIdentifier: string): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                {
                    text: '✅ Confirmar',
                    callback_data: `${CALLBACK_ACTION_CONFIRM_PREFIX}${actionIdentifier}`,
                },
                {
                    text: '❌ Cancelar',
                    callback_data: `${CALLBACK_ACTION_CANCEL_PREFIX}${actionIdentifier}`,
                },
            ],
        ],
    };
}

export const backToMenuKeyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
        [
            { text: '🏠 Voltar ao Menu', callback_data: CALLBACK_BACK_TO_MENU },
        ],
    ],
};

export const removeKeyboard: ReplyKeyboardRemove = {
    remove_keyboard: true,
};
