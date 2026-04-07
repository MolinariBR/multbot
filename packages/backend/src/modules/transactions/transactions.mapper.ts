type TransactionSummarySource = {
    id: string;
    botId: string;
    bot: {
        name: string;
    };
    customerName: string | null;
    amountBrl: number;
    depixAmount: number;
    merchantSplit: number;
    adminSplit: number;
    pixKey: string | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
};

function maskOptionalValuePrefix(
    value: string | null,
    visibleLength: number,
    suffix: string,
): string | null {
    if (!value) {
        return null;
    }

    if (value.length <= visibleLength) {
        return `${value}${suffix}`;
    }

    return `${value.slice(0, visibleLength)}${suffix}`;
}

function maskRequiredValuePrefix(value: string, visibleLength: number, suffix: string): string {
    if (value.length <= visibleLength) {
        return `${value}${suffix}`;
    }

    return `${value.slice(0, visibleLength)}${suffix}`;
}

export function mapTransactionSummary(transaction: TransactionSummarySource) {
    return {
        id: transaction.id,
        botId: transaction.botId,
        botName: transaction.bot.name,
        customerName: transaction.customerName,
        amountBrl: transaction.amountBrl,
        depixAmount: transaction.depixAmount,
        merchantSplit: transaction.merchantSplit,
        adminSplit: transaction.adminSplit,
        pixKey: maskOptionalValuePrefix(transaction.pixKey, 10, '...'),
        status: transaction.status,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
    };
}

type TransactionDetailsSource = {
    bot: {
        telegramToken: string;
    };
} & Record<string, unknown>;

export function mapTransactionDetails(transaction: TransactionDetailsSource) {
    return {
        ...transaction,
        bot: {
            ...transaction.bot,
            telegramToken: maskRequiredValuePrefix(transaction.bot.telegramToken, 10, '***'),
        },
    };
}
