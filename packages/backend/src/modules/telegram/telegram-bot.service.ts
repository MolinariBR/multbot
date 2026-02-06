import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../lib/prisma.js';

interface BotInstance {
    botId: string;
    bot: TelegramBot;
    config: {
        name: string;
        ownerName: string;
        depixAddress: string;
        splitRate: number;
    };
}

class TelegramBotManager {
    private bots: Map<string, BotInstance> = new Map();

    async initializeBot(botId: string): Promise<void> {
        try {
            // Buscar configuração do bot no banco
            const botConfig = await prisma.bot.findUnique({
                where: { id: botId },
            });

            if (!botConfig) {
                throw new Error(`Bot ${botId} não encontrado`);
            }

            if (botConfig.status !== 'active') {
                console.log(`Bot ${botConfig.name} está inativo, pulando inicialização`);
                return;
            }

            // Validar se o token parece válido (formato básico)
            if (!botConfig.telegramToken || botConfig.telegramToken.includes('EXAMPLE') || botConfig.telegramToken.length < 30) {
                console.warn(`⚠️  Bot ${botConfig.name} tem token inválido/exemplo, pulando inicialização`);
                return;
            }

            // Criar instância do bot
            const bot = new TelegramBot(botConfig.telegramToken, {
                polling: true,
            });

            // Salvar instância
            this.bots.set(botId, {
                botId,
                bot,
                config: {
                    name: botConfig.name,
                    ownerName: botConfig.ownerName,
                    depixAddress: botConfig.depixAddress,
                    splitRate: botConfig.splitRate,
                },
            });

            // Configurar handlers
            this.setupHandlers(botId);

            // Obter informações do bot
            const me = await bot.getMe();

            // Atualizar username no banco
            await prisma.bot.update({
                where: { id: botId },
                data: { telegramUsername: `@${me.username}` },
            });

            console.log(`✅ Bot ${botConfig.name} (@${me.username}) inicializado`);
        } catch (error: any) {
            console.error(`❌ Erro ao inicializar bot ${botId}:`, error.message || error);
            // Não propagar o erro para não quebrar a inicialização dos outros bots
        }
    }

    async initializeAllBots(): Promise<void> {
        try {
            const activeBots = await prisma.bot.findMany({
                where: { status: 'active' },
            });

            console.log(`🤖 Inicializando ${activeBots.length} bot(s)...`);

            for (const bot of activeBots) {
                await this.initializeBot(bot.id);
            }

            console.log(`✅ Todos os bots foram inicializados`);
        } catch (error) {
            console.error('❌ Erro ao inicializar bots:', error);
        }
    }

    private setupHandlers(botId: string): void {
        const instance = this.bots.get(botId);
        if (!instance) return;

        const { bot, config } = instance;

        // Handler: /start
        bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const { mainKeyboard } = await import('./keyboards/main.keyboard.js');

            await bot.sendMessage(
                chatId,
                `🤖 Olá! Sou o *${config.name}*\n\n` +
                `Bem-vindo ao sistema de pagamentos via Depix (Liquid Network).\n\n` +
                `*Como funciona:*\n` +
                `1️⃣ Escolha um valor ou digite o valor desejado\n` +
                `2️⃣ Receba o QR Code PIX\n` +
                `3️⃣ Pague via PIX\n` +
                `4️⃣ Receba confirmação automática\n\n` +
                `*Comandos disponíveis:*\n` +
                `/pagar - Iniciar um pagamento\n` +
                `/status - Ver status de pagamentos\n` +
                `/ajuda - Obter ajuda\n\n` +
                `Use o menu abaixo para navegar:`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: mainKeyboard,
                }
            );
        });

        // Handler: /ajuda
        bot.onText(/\/ajuda/, async (msg) => {
            const chatId = msg.chat.id;
            await bot.sendMessage(
                chatId,
                `📚 *Ajuda - ${config.name}*\n\n` +
                `*Como fazer um pagamento:*\n` +
                `1. Digite /pagar\n` +
                `2. Informe o valor em R$\n` +
                `3. Receba o QR Code PIX\n` +
                `4. Pague via PIX\n` +
                `5. Receba confirmação automática\n\n` +
                `*Outros comandos:*\n` +
                `/status - Ver seus pagamentos\n` +
                `/start - Mensagem de boas-vindas\n\n` +
                `Em caso de dúvidas, entre em contato com ${config.ownerName}.`,
                { parse_mode: 'Markdown' }
            );
        });

        // Handler: /pagar
        bot.onText(/\/pagar/, async (msg) => {
            const chatId = msg.chat.id;
            const { priceKeyboard } = await import('./keyboards/price.keyboard.js');

            await bot.sendMessage(
                chatId,
                `💰 *Iniciar Pagamento*\n\n` +
                `Escolha um valor abaixo ou selecione "Outro valor" para digitar um valor customizado:`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: priceKeyboard,
                }
            );
        });

        // Handler: /status
        bot.onText(/\/status/, async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from?.id;

            if (!userId) {
                await bot.sendMessage(chatId, '❌ Não foi possível identificar o usuário.');
                return;
            }

            // Buscar transações do usuário
            // TODO: Adicionar campo telegramUserId na tabela Transaction
            await bot.sendMessage(
                chatId,
                `📊 *Status de Pagamentos*\n\n` +
                `Funcionalidade em desenvolvimento.\n\n` +
                `Em breve você poderá consultar o histórico de seus pagamentos.`,
                { parse_mode: 'Markdown' }
            );
        });

        // Handler: Mensagens de texto do menu
        bot.on('message', async (msg) => {
            // Ignorar comandos
            if (msg.text?.startsWith('/')) return;

            const chatId = msg.chat.id;
            const text = msg.text;

            // Handlers para botões do keyboard
            if (text === '💰 Fazer Pagamento') {
                const { priceKeyboard } = await import('./keyboards/price.keyboard.js');
                await bot.sendMessage(
                    chatId,
                    `💰 *Iniciar Pagamento*\n\n` +
                    `Escolha um valor abaixo ou selecione "Outro valor" para digitar um valor customizado:`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: priceKeyboard,
                    }
                );
                return;
            }

            if (text === '📊 Meus Pagamentos') {
                await bot.sendMessage(
                    chatId,
                    `📊 *Meus Pagamentos*\n\n` +
                    `Funcionalidade em desenvolvimento.\n\n` +
                    `Em breve você poderá consultar o histórico de seus pagamentos.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            if (text === '❓ Ajuda') {
                await bot.sendMessage(
                    chatId,
                    `📚 *Ajuda - ${config.name}*\n\n` +
                    `*Como fazer um pagamento:*\n` +
                    `1. Clique em "💰 Fazer Pagamento" ou digite /pagar\n` +
                    `2. Escolha um valor ou digite um valor customizado\n` +
                    `3. Receba o QR Code PIX\n` +
                    `4. Pague via PIX\n` +
                    `5. Receba confirmação automática\n\n` +
                    `*Outros comandos:*\n` +
                    `/status - Ver seus pagamentos\n` +
                    `/start - Voltar ao início\n\n` +
                    `Em caso de dúvidas, entre em contato com ${config.ownerName}.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            if (text === 'ℹ️ Sobre') {
                await bot.sendMessage(
                    chatId,
                    `ℹ️ *Sobre - ${config.name}*\n\n` +
                    `Sistema de pagamentos via PIX integrado com Liquid Network (Bitcoin).\n\n` +
                    `*Proprietário:* ${config.ownerName}\n` +
                    `*Tecnologia:* Depix API\n` +
                    `*Rede:* Liquid Network\n\n` +
                    `Pagamentos rápidos, seguros e com confirmação automática.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // Verificar se é um valor numérico (para pagamento customizado)
            const { parsePrice } = await import('./keyboards/price.keyboard.js');
            const amountInCents = parsePrice(text || '');

            if (amountInCents && amountInCents > 0) {
                const userId = msg.from?.id;

                if (!userId) {
                    await bot.sendMessage(chatId, '❌ Não foi possível identificar o usuário.');
                    return;
                }

                // Processar pagamento
                const { processPayment } = await import('./handlers/payment.handler.js');
                await processPayment(bot, {
                    botId,
                    chatId,
                    userId,
                    amountInCents,
                    botConfig: config,
                });
            }
        });

        // Handler: Callback queries (botões inline)
        bot.on('callback_query', async (query) => {
            const chatId = query.message?.chat.id;
            const data = query.data;

            if (!chatId || !data) return;

            // Responder ao callback para remover loading
            await bot.answerCallbackQuery(query.id);

            // Handler para valores pré-definidos
            if (data.startsWith('pay_')) {
                const amountStr = data.replace('pay_', '');

                if (amountStr === 'custom') {
                    await bot.sendMessage(
                        chatId,
                        `💵 *Valor Customizado*\n\n` +
                        `Digite o valor que deseja pagar em R$.\n\n` +
                        `Exemplos: 100, 150.50, 200,00`,
                        { parse_mode: 'Markdown' }
                    );
                    return;
                }

                const amountInCents = parseInt(amountStr);
                const userId = query.from?.id;

                if (!userId) {
                    await bot.sendMessage(chatId, '❌ Não foi possível identificar o usuário.');
                    return;
                }

                // Processar pagamento
                const { processPayment } = await import('./handlers/payment.handler.js');
                await processPayment(bot, {
                    botId,
                    chatId,
                    userId,
                    amountInCents,
                    botConfig: config,
                });
                return;
            }

            // Handler para cancelar pagamento
            if (data === 'cancel_payment') {
                await bot.sendMessage(
                    chatId,
                    `❌ Pagamento cancelado.\n\n` +
                    `Use /pagar para iniciar um novo pagamento.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // Handler para voltar ao menu
            if (data === 'back_to_menu') {
                const { mainKeyboard } = await import('./keyboards/main.keyboard.js');
                await bot.sendMessage(
                    chatId,
                    `🏠 Menu Principal\n\n` +
                    `Use os botões abaixo para navegar:`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: mainKeyboard,
                    }
                );
                return;
            }
        });

        // Handler: Erros
        bot.on('polling_error', (error) => {
            console.error(`❌ Erro de polling no bot ${config.name}:`, error);
        });
    }

    async stopBot(botId: string): Promise<void> {
        const instance = this.bots.get(botId);
        if (instance) {
            await instance.bot.stopPolling();
            this.bots.delete(botId);
            console.log(`🛑 Bot ${instance.config.name} parado`);
        }
    }

    async stopAllBots(): Promise<void> {
        console.log('🛑 Parando todos os bots...');
        for (const [botId] of this.bots) {
            await this.stopBot(botId);
        }
    }

    getBotInstance(botId: string): TelegramBot | undefined {
        return this.bots.get(botId)?.bot;
    }

    getAllBots(): Map<string, BotInstance> {
        return this.bots;
    }
}

// Singleton
export const telegramBotManager = new TelegramBotManager();
