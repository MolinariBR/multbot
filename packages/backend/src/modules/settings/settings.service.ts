import type { Prisma, Settings } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import type { UpdateSettingsInput } from './settings.schema.js';

const SETTINGS_ID = 'settings';
const MASKED_SECRET_VALUE = '***';

type DepixConnectionTestResult =
    | { success: true }
    | { success: false; error: string };

function isMaskedSecretValue(value: string | undefined): boolean {
    return value === MASKED_SECRET_VALUE;
}

function maskSensitiveSettings(settings: Settings): Settings {
    return {
        ...settings,
        depixApiKey: settings.depixApiKey ? MASKED_SECRET_VALUE : '',
        depixWebhookSecret: settings.depixWebhookSecret ? MASKED_SECRET_VALUE : '',
        telegramApiHash: settings.telegramApiHash ? MASKED_SECRET_VALUE : '',
    };
}

async function findOrCreateSettings(): Promise<Settings> {
    const settings = await prisma.settings.findUnique({
        where: { id: SETTINGS_ID },
    });

    if (settings) {
        return settings;
    }

    return prisma.settings.create({
        data: { id: SETTINGS_ID },
    });
}

function buildSanitizedSettingsInput(input: UpdateSettingsInput): UpdateSettingsInput {
    const {
        depixApiKey,
        depixWebhookSecret,
        telegramApiHash,
        ...otherFields
    } = input;

    const sanitizedInput: UpdateSettingsInput = { ...otherFields };

    if (depixApiKey !== undefined && !isMaskedSecretValue(depixApiKey)) {
        sanitizedInput.depixApiKey = depixApiKey;
    }

    if (depixWebhookSecret !== undefined && !isMaskedSecretValue(depixWebhookSecret)) {
        sanitizedInput.depixWebhookSecret = depixWebhookSecret;
    }

    if (telegramApiHash !== undefined && !isMaskedSecretValue(telegramApiHash)) {
        sanitizedInput.telegramApiHash = telegramApiHash;
    }

    return sanitizedInput;
}

function buildSettingsUpdateData(input: UpdateSettingsInput): Prisma.SettingsUpdateInput {
    return { ...buildSanitizedSettingsInput(input) };
}

function buildSettingsCreateData(input: UpdateSettingsInput): Prisma.SettingsCreateInput {
    return {
        id: SETTINGS_ID,
        ...buildSanitizedSettingsInput(input),
    };
}

function buildDepixPingUrl(baseUrl: string): string {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    return `${normalizedBaseUrl}/ping`;
}

function getDepixConnectionErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
}

export async function getSettings() {
    const settings = await findOrCreateSettings();
    return maskSensitiveSettings(settings);
}

export async function updateSettings(input: UpdateSettingsInput) {
    const updateData = buildSettingsUpdateData(input);
    const createData = buildSettingsCreateData(input);

    const settings = await prisma.settings.upsert({
        where: { id: SETTINGS_ID },
        update: updateData,
        create: createData,
    });

    return maskSensitiveSettings(settings);
}

export async function testDepixConnection(): Promise<DepixConnectionTestResult> {
    const settings = await findOrCreateSettings();

    if (!settings?.depixApiUrl || !settings?.depixApiKey) {
        return { success: false, error: 'Configurações Depix incompletas' };
    }

    try {
        const response = await fetch(buildDepixPingUrl(settings.depixApiUrl), {
            headers: {
                'Authorization': `Bearer ${settings.depixApiKey}`,
            },
        });

        if (response.ok) {
            return { success: true };
        }

        return { success: false, error: `Erro ${response.status} ao acessar endpoint /ping da Depix` };
    } catch (error: unknown) {
        return {
            success: false,
            error: `Não foi possível conectar à API Depix: ${getDepixConnectionErrorMessage(error)}`,
        };
    }
}
