import 'dotenv/config';

/**
 * Script para testar o webhook da Depix localmente
 * Simula o recebimento de um webhook com informações do pagador
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testWebhook() {
    console.log('🧪 Testando Webhook Depix com informações do pagador\n');

    // IMPORTANTE: Substitua este ID pelo depixPaymentId de uma transação real
    // Você pode pegar do banco ou criar um pagamento novo pelo bot
    const DEPIX_PAYMENT_ID = '019c33698fd77edc8874f427c5edeabe';

    console.log(`⚠️  ATENÇÃO: Usando depixPaymentId: ${DEPIX_PAYMENT_ID}`);
    console.log('   Se você não tiver uma transação com este ID, o webhook não vai encontrar nada.\n');

    // Simular payload do webhook da Depix
    const webhookPayload = {
        webhookType: 'deposit',
        qrId: DEPIX_PAYMENT_ID,
        status: 'depix_sent',
        valueInCents: 1000,
        pixKey: '00020101021226860014br.gov.bcb.pix...',

        // Informações do Pagador (simuladas)
        payerName: 'JOÃO DA SILVA TESTE',
        payerTaxNumber: '12345678900',
        payerEUID: 'EU123456789012345',
        bankTxId: 'E10FCC535C7922BFFF7AA2E8302842520',
        blockchainTxID: 'abc123def456...',
        customerMessage: 'Pagamento de teste via script',
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    console.log('📤 Enviando webhook simulado:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('');

    try {
        const response = await fetch(`${API_URL}/api/depix/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Webhook processado com sucesso!');
            console.log('📥 Resposta:', JSON.stringify(data, null, 2));
            console.log('\n💡 Agora verifique a transação no banco de dados ou no painel web.');
            console.log('   As informações do pagador devem estar salvas!');
        } else {
            console.log('❌ Erro ao processar webhook:', response.status);
            console.log('📥 Resposta:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

// Função para consultar uma transação e ver os dados
async function checkTransaction(transactionId: string) {
    console.log(`\n🔍 Consultando transação: ${transactionId}\n`);

    try {
        const response = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
            headers: {
                // Adicione token JWT se necessário
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Transação encontrada:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Erro ao consultar transação:', response.status);
            console.log('📥 Resposta:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

// Executar teste
console.log('═══════════════════════════════════════════════════════');
console.log('  TESTE DE WEBHOOK DEPIX - INFORMAÇÕES DO PAGADOR');
console.log('═══════════════════════════════════════════════════════\n');

testWebhook();

// Se você quiser testar a consulta de uma transação específica:
// checkTransaction('cmlb03gpr0001ossa3i45cyqa');
