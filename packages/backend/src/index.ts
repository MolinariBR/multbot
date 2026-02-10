import { buildApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function main() {
    const app = await buildApp();

    try {
        // Testar conexão com banco
        await prisma.$connect();
        console.log('✅ Conectado ao banco de dados');

        // Inicializar serviços
        const { depixService } = await import('./modules/depix/depix.service.js');
        await depixService.initialize();

        const { telegramBotManager } = await import('./modules/telegram/telegram-bot.service.js');
        await telegramBotManager.initializeAllBots();

        // Admin notifications (Telegram bot)
        const { adminTelegramBot } = await import('./modules/notifications/admin-telegram-bot.service.js');
        adminTelegramBot.initialize();

        // Iniciar servidor
        await app.listen({ port: env.PORT, host: env.HOST });
        console.log(`🚀 Servidor rodando em http://${env.HOST}:${env.PORT}`);
        console.log(`📚 Documentação em http://${env.HOST}:${env.PORT}/docs`);
    } catch (err) {
        app.log.error(err);
        await prisma.$disconnect();
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    const { telegramBotManager } = await import('./modules/telegram/telegram-bot.service.js');
    await telegramBotManager.stopAllBots();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    const { telegramBotManager } = await import('./modules/telegram/telegram-bot.service.js');
    await telegramBotManager.stopAllBots();
    await prisma.$disconnect();
    process.exit(0);
});

main();
