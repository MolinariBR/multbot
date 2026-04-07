import type { Transaction } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const BRAZILIAN_LOCALE = 'pt-BR';
const SECTION_DIVIDER = '─'.repeat(53);
const MISSING_PAYER_INFO = '❌ Não capturado';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

function formatCurrency(amountInCents: number): string {
    return `R$ ${(amountInCents / 100).toFixed(2)}`;
}

function formatOptionalValue(value: string | null): string {
    return value ?? MISSING_PAYER_INFO;
}

function printSection(title: string): void {
    console.log(title);
    console.log(SECTION_DIVIDER);
}

function printNoTransactionMessage(): void {
    console.log('⚠️  Nenhuma transação encontrada no banco.');
    console.log('Crie uma transação primeiro usando o bot do Telegram.');
}

function printTransactionSummary(transaction: Transaction): void {
    printSection('📊 Última transação encontrada:');
    console.log(`ID: ${transaction.id}`);
    console.log(`Depix Payment ID: ${transaction.depixPaymentId ?? 'N/A'}`);
    console.log(`Status: ${transaction.status}`);
    console.log(`Valor: ${formatCurrency(transaction.amountBrl)}`);
    console.log(`Criado em: ${transaction.createdAt.toLocaleString(BRAZILIAN_LOCALE)}`);
    console.log('');
}

function printPayerInfo(transaction: Transaction): void {
    printSection('👤 INFORMAÇÕES DO PAGADOR:');
    console.log(`Nome: ${formatOptionalValue(transaction.payerName)}`);
    console.log(`CPF/CNPJ: ${formatOptionalValue(transaction.payerTaxNumber)}`);
    console.log(`EUID: ${formatOptionalValue(transaction.payerEUID)}`);
    console.log(`Bank TX ID: ${formatOptionalValue(transaction.bankTxId)}`);
    console.log(`Blockchain TX: ${formatOptionalValue(transaction.blockchainTxId)}`);
    console.log(`Mensagem: ${formatOptionalValue(transaction.customerMessage)}`);
    console.log('');
}

function printPayerInfoHint(): void {
    console.log('💡 DICA: As informações do pagador são capturadas quando:');
    console.log('1. O usuário paga o PIX');
    console.log('2. A Depix envia o webhook de confirmação');
    console.log('3. O webhook é processado com sucesso');
    console.log('');
    console.log('Para testar, você pode:');
    console.log('- Fazer um pagamento real pelo bot');
    console.log('- OU usar o script test-webhook.ts para simular');
}

function printPayerInfoStatus(transaction: Transaction): void {
    if (transaction.payerName) {
        console.log('✅ Informações do pagador capturadas com sucesso!');
        return;
    }

    printPayerInfoHint();
}

function printFullTransactionData(transaction: Transaction): void {
    console.log('');
    printSection('📋 DADOS COMPLETOS DA TRANSAÇÃO:');
    console.log(JSON.stringify(transaction, null, 2));
}

async function fetchLatestTransaction(): Promise<Transaction | null> {
    return prismaClient.transaction.findFirst({
        orderBy: { createdAt: 'desc' },
    });
}

async function checkLatestPayerInfo(): Promise<void> {
    console.log('🧪 Testando captura de informações do pagador\n');

    try {
        const latestTransaction = await fetchLatestTransaction();
        if (!latestTransaction) {
            printNoTransactionMessage();
            return;
        }

        printTransactionSummary(latestTransaction);
        printPayerInfo(latestTransaction);
        printPayerInfoStatus(latestTransaction);
        printFullTransactionData(latestTransaction);
    } catch (error: unknown) {
        process.exitCode = 1;
        console.error('❌ Falha ao consultar informações do pagador', {
            error: getErrorMessage(error),
        });
    } finally {
        await prismaClient.$disconnect();
    }
}

void checkLatestPayerInfo();
