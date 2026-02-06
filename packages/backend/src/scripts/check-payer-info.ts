import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPayerInfoCapture() {
    console.log('🧪 Testando captura de informações do pagador\n');

    try {
        // 1. Buscar a última transação
        const lastTransaction = await prisma.transaction.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { bot: true },
        });

        if (!lastTransaction) {
            console.log('⚠️  Nenhuma transação encontrada no banco.');
            console.log('   Crie uma transação primeiro usando o bot do Telegram.');
            return;
        }

        console.log('📊 Última transação encontrada:');
        console.log('─────────────────────────────────────────────────────');
        console.log(`ID: ${lastTransaction.id}`);
        console.log(`Depix Payment ID: ${lastTransaction.depixPaymentId || 'N/A'}`);
        console.log(`Status: ${lastTransaction.status}`);
        console.log(`Valor: R$ ${(lastTransaction.amountBrl / 100).toFixed(2)}`);
        console.log(`Criado em: ${lastTransaction.createdAt.toLocaleString('pt-BR')}`);
        console.log('');

        console.log('👤 INFORMAÇÕES DO PAGADOR:');
        console.log('─────────────────────────────────────────────────────');
        console.log(`Nome: ${lastTransaction.payerName || '❌ Não capturado'}`);
        console.log(`CPF/CNPJ: ${lastTransaction.payerTaxNumber || '❌ Não capturado'}`);
        console.log(`EUID: ${lastTransaction.payerEUID || '❌ Não capturado'}`);
        console.log(`Bank TX ID: ${lastTransaction.bankTxId || '❌ Não capturado'}`);
        console.log(`Blockchain TX: ${lastTransaction.blockchainTxId || '❌ Não capturado'}`);
        console.log(`Mensagem: ${lastTransaction.customerMessage || '❌ Não capturado'}`);
        console.log('');

        if (!lastTransaction.payerName) {
            console.log('💡 DICA: As informações do pagador são capturadas quando:');
            console.log('   1. O usuário paga o PIX');
            console.log('   2. A Depix envia o webhook de confirmação');
            console.log('   3. O webhook é processado com sucesso');
            console.log('');
            console.log('   Para testar, você pode:');
            console.log('   - Fazer um pagamento real pelo bot');
            console.log('   - OU usar o script test-webhook.ts para simular');
        } else {
            console.log('✅ Informações do pagador capturadas com sucesso!');
        }

        console.log('');
        console.log('📋 DADOS COMPLETOS DA TRANSAÇÃO:');
        console.log('─────────────────────────────────────────────────────');
        console.log(JSON.stringify(lastTransaction, null, 2));

    } catch (error) {
        console.error('❌ Erro ao consultar banco de dados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPayerInfoCapture();
