import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed...');

    // Criar admin padrão
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log(`✅ Admin já existe: ${adminEmail}`);
    } else {
        const hashedPassword = await hashPassword(adminPassword);

        await prisma.admin.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: adminName,
            },
        });

        console.log(`✅ Admin criado: ${adminEmail}`);
        console.log(`   Senha: ${adminPassword}`);
    }

    // Criar settings padrão
    const existingSettings = await prisma.settings.findUnique({
        where: { id: 'settings' },
    });

    if (!existingSettings) {
        await prisma.settings.create({
            data: { id: 'settings' },
        });
        console.log('✅ Settings criado');
    }

    // Criar dados de exemplo (opcional, para desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
        const existingBot = await prisma.bot.findFirst();

        if (!existingBot) {
            const bot = await prisma.bot.create({
                data: {
                    name: 'MultBot Store',
                    telegramToken: '8374587252:AAGsF-4eLbTZxCOMisoTzutKWAcbcGsoCQQ',
                    telegramUsername: '@mulltti_bot',
                    ownerName: 'João Silva',
                    depixAddress: 'VJLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                    splitRate: 0.10,
                    status: 'active',
                },
            });

            console.log(`✅ Bot de exemplo criado: ${bot.name}`);

            // Criar algumas transações de exemplo
            const transactions = [
                { amountBrl: 15000, status: 'completed' },
                { amountBrl: 20000, status: 'completed' },
                { amountBrl: 5000, status: 'processing' },
                { amountBrl: 10000, status: 'failed' },
            ];

            for (const tx of transactions) {
                const merchantSplit = Math.round(tx.amountBrl * (1 - bot.splitRate));
                const adminSplit = tx.amountBrl - merchantSplit;

                await prisma.transaction.create({
                    data: {
                        botId: bot.id,
                        amountBrl: tx.amountBrl,
                        depixAmount: Math.round(tx.amountBrl * 0.3), // Exemplo
                        merchantSplit,
                        adminSplit,
                        customerName: 'Cliente Exemplo',
                        status: tx.status,
                        completedAt: tx.status === 'completed' ? new Date() : null,
                    },
                });
            }

            console.log('✅ Transações de exemplo criadas');
        }
    }

    console.log('🎉 Seed concluído!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
