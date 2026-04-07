import type { InlineKeyboardButton, InlineKeyboardMarkup } from 'node-telegram-bot-api';

const QUICK_PAYMENT_ROW_SIZE = 2;
const CALLBACK_PAY_PREFIX = 'pay_';
const CALLBACK_CONFIRM_PAY_PREFIX = 'confirm_pay_';
const CALLBACK_CHECK_PAYMENT_PREFIX = 'check_payment_';
const CALLBACK_CANCEL_TRANSACTION_PREFIX = 'cancel_tx_';
const CALLBACK_CANCEL_PAYMENT = 'cancel_payment';
const CALLBACK_PAY_CUSTOM = 'pay_custom';
const CALLBACK_BACK_TO_MENU = 'back_to_menu';

type QuickPaymentValue = {
    label: string;
    value: number;
};

export const QUICK_PAYMENT_VALUES: ReadonlyArray<QuickPaymentValue> = [
    { label: 'R$ 10,00', value: 1000 },
    { label: 'R$ 25,00', value: 2500 },
    { label: 'R$ 50,00', value: 5000 },
    { label: 'R$ 100,00', value: 10000 },
    { label: 'R$ 250,00', value: 25000 },
    { label: 'R$ 500,00', value: 50000 },
];

function groupButtonsByRow(
    buttons: InlineKeyboardButton[],
    rowSize: number,
): InlineKeyboardButton[][] {
    const rows: InlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += rowSize) {
        rows.push(buttons.slice(index, index + rowSize));
    }

    return rows;
}

function createQuickPaymentButtons(): InlineKeyboardButton[] {
    return QUICK_PAYMENT_VALUES.map((quickPaymentValue) => ({
        text: quickPaymentValue.label,
        callback_data: `${CALLBACK_PAY_PREFIX}${quickPaymentValue.value}`,
    }));
}

function createPriceKeyboard(): InlineKeyboardMarkup {
    const quickPaymentRows = groupButtonsByRow(createQuickPaymentButtons(), QUICK_PAYMENT_ROW_SIZE);

    return {
        inline_keyboard: [
            ...quickPaymentRows,
            [{ text: '💵 Outro valor', callback_data: CALLBACK_PAY_CUSTOM }],
            [{ text: '❌ Cancelar', callback_data: CALLBACK_CANCEL_PAYMENT }],
        ],
    };
}

export const priceKeyboard: InlineKeyboardMarkup = createPriceKeyboard();

export function customPriceKeyboard(amountInCents: number): InlineKeyboardMarkup {
    const formattedAmount = formatPrice(amountInCents).replace('R$ ', '');

    return {
        inline_keyboard: [
            [
                {
                    text: `✅ Confirmar R$ ${formattedAmount}`,
                    callback_data: `${CALLBACK_CONFIRM_PAY_PREFIX}${amountInCents}`,
                },
            ],
            [{ text: '❌ Cancelar', callback_data: CALLBACK_CANCEL_PAYMENT }],
        ],
    };
}

export function paymentActionsKeyboard(transactionId: string): InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                {
                    text: '🔄 Verificar Status',
                    callback_data: `${CALLBACK_CHECK_PAYMENT_PREFIX}${transactionId}`,
                },
            ],
            [
                {
                    text: '❌ Cancelar Pagamento',
                    callback_data: `${CALLBACK_CANCEL_TRANSACTION_PREFIX}${transactionId}`,
                },
            ],
            [{ text: '🏠 Menu Principal', callback_data: CALLBACK_BACK_TO_MENU }],
        ],
    };
}

export function formatPrice(amountInCents: number): string {
    return `R$ ${(amountInCents / 100).toFixed(2).replace('.', ',')}`;
}

export function parsePrice(priceInput: string): number | null {
    const numericPriceText = priceInput.replace(/[^\d,.\s]/g, '').replace(/\s+/g, '');
    if (!numericPriceText) {
        return null;
    }

    const hasCommaSeparator = numericPriceText.includes(',');
    const hasDotSeparator = numericPriceText.includes('.');
    if (hasCommaSeparator && hasDotSeparator) {
        return null;
    }

    const normalizedPriceText = hasCommaSeparator
        ? numericPriceText.replace(',', '.')
        : numericPriceText;

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedPriceText)) {
        return null;
    }

    const parsedValue = Number(normalizedPriceText);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return Math.round(parsedValue * 100);
}
