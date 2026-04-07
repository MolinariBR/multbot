import 'dotenv/config';
import { comparePassword } from '../lib/hash.js';
import { prisma } from '../lib/prisma.js';

const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
const DEFAULT_ADMIN_PASSWORD = 'password123';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

function printEnvironmentDebugInfo(): void {
    console.log('--- DIAGNÓSTICO DE LOGIN ---');
    console.log('1. Variáveis de Ambiente:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL);
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   Dir atual:', process.cwd());
}

async function findAdminByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
}

async function printAdminListIfExists(): Promise<void> {
    const totalAdmins = await prisma.admin.count();
    console.log('   Total de usuários no banco:', totalAdmins);

    if (totalAdmins === 0) {
        return;
    }

    const adminUsers = await prisma.admin.findMany();
    console.log('   Usuários existentes:', adminUsers.map((adminUser) => adminUser.email));
}

async function validateAdminPassword(
    adminPasswordHash: string,
    rawPassword: string,
): Promise<void> {
    console.log('\n3. Testando senha...');
    const isPasswordValid = await comparePassword(rawPassword, adminPasswordHash);

    if (isPasswordValid) {
        console.log('✅ SENHA CORRETA! O login deveria funcionar.');
        return;
    }

    console.error('❌ SENHA INCORRETA!');
    console.log(`   A senha no banco não bate com "${rawPassword}"`);
}

async function runLoginDiagnostic(): Promise<void> {
    printEnvironmentDebugInfo();
    console.log(`\n2. Buscando usuário: ${DEFAULT_ADMIN_EMAIL}`);

    try {
        const adminUser = await findAdminByEmail(DEFAULT_ADMIN_EMAIL);

        if (!adminUser) {
            console.error('❌ ERRO: Usuário não encontrado no banco!');
            await printAdminListIfExists();
            return;
        }

        console.log('✅ Usuário encontrado!');
        console.log('   ID:', adminUser.id);

        await validateAdminPassword(adminUser.password, DEFAULT_ADMIN_PASSWORD);
    } catch (error: unknown) {
        process.exitCode = 1;
        console.error('❌ Falha durante diagnóstico de login', {
            error: getErrorMessage(error),
        });
    } finally {
        await prisma.$disconnect();
    }
}

void runLoginDiagnostic();
