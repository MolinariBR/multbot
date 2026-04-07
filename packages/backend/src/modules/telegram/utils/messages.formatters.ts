const BRAZILIAN_LOCALE = 'pt-BR';
const MINUTE_IN_MILLISECONDS = 60_000;
const MINUTES_IN_HOUR = 60;

function normalizeDateInput(dateInput: Date | string): Date {
    const parsedDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return parsedDate;
}

function isValidDate(date: Date): boolean {
    return !Number.isNaN(date.getTime());
}

export function formatBRL(amountInCents: number): string {
    return `R$ ${(amountInCents / 100).toFixed(2).replace('.', ',')}`;
}

export function formatDate(dateInput: Date | string): string {
    const date = normalizeDateInput(dateInput);
    if (!isValidDate(date)) {
        return 'Data inválida';
    }

    return date.toLocaleString(BRAZILIAN_LOCALE, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatExpiration(expiresAtInput: Date | string): string {
    const expirationDate = normalizeDateInput(expiresAtInput);
    if (!isValidDate(expirationDate)) {
        return 'Data inválida';
    }

    const minutesUntilExpiration = Math.floor(
        (expirationDate.getTime() - Date.now()) / MINUTE_IN_MILLISECONDS,
    );

    if (minutesUntilExpiration <= 0) {
        return 'Expirado';
    }

    if (minutesUntilExpiration < MINUTES_IN_HOUR) {
        return `${minutesUntilExpiration} minuto(s)`;
    }

    const hours = Math.floor(minutesUntilExpiration / MINUTES_IN_HOUR);
    const minutes = minutesUntilExpiration % MINUTES_IN_HOUR;
    return `${hours}h ${minutes}min`;
}
