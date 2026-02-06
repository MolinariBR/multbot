import 'dotenv/config';

// Simular a geração de EUID
function generateEUID(userId: number): string {
    const timestamp = Date.now().toString().slice(-8);
    const userIdStr = String(userId).slice(-7).padStart(7, '0');
    const euid = `EU${timestamp}${userIdStr}`;
    return euid;
}

// Testar com diferentes user IDs
const testUserIds = [
    6721416266,  // ID real do usuário
    123,         // ID pequeno
    999999999999, // ID muito grande
];

console.log('🧪 Testando geração de EUID:\n');

for (const userId of testUserIds) {
    const euid = generateEUID(userId);
    const isValid = euid.length === 17 && euid.startsWith('EU');

    console.log(`User ID: ${userId}`);
    console.log(`EUID: ${euid}`);
    console.log(`Tamanho: ${euid.length} caracteres`);
    console.log(`Válido: ${isValid ? '✅' : '❌'}`);
    console.log('---');
}

// Testar chamada real à API Depix (se configurado)
async function testDepixAPI() {
    const apiUrl = process.env.DEPIX_API_URL || 'https://api.eulen.app';
    const apiKey = process.env.DEPIX_API_KEY;

    if (!apiKey) {
        console.log('\n⚠️  DEPIX_API_KEY não configurado. Pulando teste de API real.');
        return;
    }

    console.log('\n🌐 Testando chamada real à API Depix...\n');

    const payload = {
        amountInCents: 100, // R$ 1,00
        endUserFullName: 'Teste Usuario',
        // Não enviar EUID - deixar a Depix gerar
    };

    console.log('📤 Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`${apiUrl}/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Sucesso!');
            console.log('📥 Resposta:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Erro:', response.status);
            console.log('📥 Resposta:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

testDepixAPI();
