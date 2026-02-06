import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../lib/hash.js';
import 'dotenv/config';

async function main() {
    console.log('--- DIAGNÓSTICO DE LOGIN ---');
    console.log('1. Variáveis de Ambiente:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL);
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   Dir atual:', process.cwd());

    const email = 'admin@test.com';
    const password = 'password123';

    console.log(`\n2. Buscando usuário: ${email}`);
    try {
        const user = await prisma.admin.findUnique({ where: { email } });

        if (!user) {
            console.error('❌ ERRO: Usuário não encontrado no banco!');
            const count = await prisma.admin.count();
            console.log('   Total de usuários no banco:', count);

            if (count > 0) {
                const allUsers = await prisma.admin.findMany();
                console.log('   Usuários existentes:', allUsers.map(u => u.email));
            }
            return;
        }

        console.log('✅ Usuário encontrado!');
        console.log('   ID:', user.id);

        console.log('\n3. Testando senha...');
        const isValid = await comparePassword(password, user.password);

        if (isValid) {
            console.log('✅ SENHA CORRETA! O login deveria funcionar.');
        } else {
            console.error('❌ SENHA INCORRETA!');
            console.log('   A senha no banco não bate com "password123"');
        }
    } catch (e) {
        console.error('❌ ERRO FATAL ao conectar no banco:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
