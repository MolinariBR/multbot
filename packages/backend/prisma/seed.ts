import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash.js';

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
const DEFAULT_ADMIN_PASSWORD = 'password123';
const DEFAULT_ADMIN_NAME = 'Administrador';

const SAMPLE_BOT_DATA = {
    name: 'MultBot Store',
    telegramToken: '8374587252:AAGsF-4eLbTZxCOMisoTzutKWAcbcGsoCQQ',
    telegramUsername: '@mulltti_bot',
    ownerName: 'João Silva',
    depixAddress: 'VJLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    splitRate: 0.10,
    status: 'active',
};

const SAMPLE_TRANSACTIONS = [
    { amountBrl: 15000, status: 'completed' },
    { amountBrl: 20000, status: 'completed' },
    { amountBrl: 5000, status: 'processing' },
    { amountBrl: 10000, status: 'failed' },
] as const;

type SampleTransaction = (typeof SAMPLE_TRANSACTIONS)[number];

function resolveAdminSeedData() {
    const email = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME;
    const isDefaultPassword = password === DEFAULT_ADMIN_PASSWORD;

    return { email, password, name, isDefaultPassword };
}

function shouldSeedSampleData(): boolean {
    const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
    const hasForcedSampleData = process.env.FORCE_SAMPLE_DATA === 'true';

    return isDevelopmentEnvironment || hasForcedSampleData;
}

function calculateSplitAmounts(amountBrl: number, splitRate: number) {
    const merchantSplit = Math.round(amountBrl * (1 - splitRate));
    const adminSplit = amountBrl - merchantSplit;

    return { merchantSplit, adminSplit };
}

async function ensureDefaultAdmin(): Promise<void> {
    const adminSeedData = resolveAdminSeedData();
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminSeedData.email },
    });

    if (existingAdmin) {
        console.log(`✅ Admin já existe: ${adminSeedData.email}`);
        return;
    }

    const hashedPassword = await hashPassword(adminSeedData.password);
    await prisma.admin.create({
        data: {
            email: adminSeedData.email,
            password: hashedPassword,
            name: adminSeedData.name,
        },
    });

    console.log(`✅ Admin criado: ${adminSeedData.email}`);
    if (adminSeedData.isDefaultPassword) {
        console.log('⚠️ Senha padrão em uso. Defina ADMIN_PASSWORD para alterar.');
    }
}

async function ensureDefaultSettings(): Promise<void> {
    const existingSettings = await prisma.settings.findUnique({
        where: { id: 'settings' },
    });

    if (existingSettings) {
        return;
    }

    await prisma.settings.create({
        data: { id: 'settings' },
    });
    console.log('✅ Settings criado');
}

function buildTransactionData(sampleTransaction: SampleTransaction, botId: string, splitRate: number) {
    const splitAmounts = calculateSplitAmounts(sampleTransaction.amountBrl, splitRate);
    const isCompleted = sampleTransaction.status === 'completed';

    return {
        botId,
        amountBrl: sampleTransaction.amountBrl,
        depixAmount: Math.round(sampleTransaction.amountBrl * 0.3),
        merchantSplit: splitAmounts.merchantSplit,
        adminSplit: splitAmounts.adminSplit,
        customerName: 'Cliente Exemplo',
        status: sampleTransaction.status,
        completedAt: isCompleted ? new Date() : null,
    };
}

async function createSampleTransactions(botId: string, splitRate: number): Promise<void> {
    for (const sampleTransaction of SAMPLE_TRANSACTIONS) {
        await prisma.transaction.create({
            data: buildTransactionData(sampleTransaction, botId, splitRate),
        });
    }
}

async function ensureSampleData(): Promise<void> {
    if (!shouldSeedSampleData()) {
        return;
    }

    const existingBot = await prisma.bot.findFirst();
    if (existingBot) {
        return;
    }

    const sampleBot = await prisma.bot.create({
        data: SAMPLE_BOT_DATA,
    });

    console.log(`✅ Bot de exemplo criado: ${sampleBot.name}`);
    await createSampleTransactions(sampleBot.id, sampleBot.splitRate);
    console.log('✅ Transações de exemplo criadas');
}

async function runSeed(): Promise<void> {
    console.log('🌱 Iniciando seed...');
    await ensureDefaultAdmin();
    await ensureDefaultSettings();
    await ensureSampleData();
    console.log('🎉 Seed concluído!');
}

async function executeSeed(): Promise<void> {
    try {
        await runSeed();
    } catch (error: unknown) {
        console.error('❌ Erro no seed:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

void executeSeed();
