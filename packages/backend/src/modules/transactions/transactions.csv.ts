type TransactionCsvSource = {
    id: string;
    bot: {
        name: string;
    };
    customerName: string | null;
    amountBrl: number;
    merchantSplit: number;
    adminSplit: number;
    status: string;
    createdAt: Date;
};

function escapeCsvCell(value: string): string {
    const escapedValue = value.replace(/"/g, '""');
    return /[",\n]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
}

function csvRow(values: Array<string | number | null | undefined>): string {
    return values
        .map((value) => (value === null || value === undefined ? '' : String(value)))
        .map(escapeCsvCell)
        .join(',');
}

export function buildTransactionsCsv(transactions: TransactionCsvSource[]): string {
    const headers = ['ID', 'Bot', 'Cliente', 'Valor (R$)', 'Merchant', 'Admin', 'Status', 'Data'];
    const rows = transactions.map((transaction) => csvRow([
        transaction.id,
        transaction.bot.name,
        transaction.customerName || '',
        (transaction.amountBrl / 100).toFixed(2),
        (transaction.merchantSplit / 100).toFixed(2),
        (transaction.adminSplit / 100).toFixed(2),
        transaction.status,
        transaction.createdAt.toISOString(),
    ]));

    return [csvRow(headers), ...rows].join('\n');
}
