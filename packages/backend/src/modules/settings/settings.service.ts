import { prisma } from '../../lib/prisma.js';
import type { UpdateSettingsInput } from './settings.schema.js';

const SETTINGS_ID = 'settings';

export async function getSettings() {
    let settings = await prisma.settings.findUnique({
        where: { id: SETTINGS_ID },
    });

    // Criar settings se não existir
    if (!settings) {
        settings = await prisma.settings.create({
            data: { id: SETTINGS_ID },
        });
    }

    // Ocultar valores sensíveis
    return {
        ...settings,
        depixApiKey: settings.depixApiKey ? '***' : '',
        depixWebhookSecret: settings.depixWebhookSecret ? '***' : '',
        telegramApiHash: settings.telegramApiHash ? '***' : '',
    };
}

export async function updateSettings(input: UpdateSettingsInput) {
    // Buscar settings atual para não sobrescrever valores sensíveis com ***
    const current = await prisma.settings.findUnique({
        where: { id: SETTINGS_ID },
    });

    const data: any = { ...input };

    // Não atualizar se o valor for *** (significa que não foi alterado)
    if (input.depixApiKey === '***') {
        delete data.depixApiKey;
    }
    if (input.depixWebhookSecret === '***') {
        delete data.depixWebhookSecret;
    }
    if (input.telegramApiHash === '***') {
        delete data.telegramApiHash;
    }

    const settings = await prisma.settings.upsert({
        where: { id: SETTINGS_ID },
        update: data,
        create: { id: SETTINGS_ID, ...data },
    });

    return {
        ...settings,
        depixApiKey: settings.depixApiKey ? '***' : '',
        depixWebhookSecret: settings.depixWebhookSecret ? '***' : '',
        telegramApiHash: settings.telegramApiHash ? '***' : '',
    };
}

export async function testDepixConnection() {
    const settings = await prisma.settings.findUnique({
        where: { id: SETTINGS_ID },
    });

    if (!settings?.depixApiUrl || !settings?.depixApiKey) {
        return { success: false, error: 'Configurações Depix incompletas' };
    }

    try {
        const response = await fetch(`${settings.depixApiUrl}/ping`, {
            headers: {
                'Authorization': `Bearer ${settings.depixApiKey}`,
            },
        });

        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: `Erro ${response.status}` };
        }
    } catch (error) {
        return { success: false, error: 'Não foi possível conectar à API Depix' };
    }
}
