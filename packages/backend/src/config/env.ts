import { z } from 'zod';
import 'dotenv/config';

const optionalEnvString = z.string().trim().optional().or(z.literal(''));

const envSchema = z.object({
    // Server
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    HOST: z.string().default('0.0.0.0'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Auth
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('24h'),

    // Database
    DATABASE_URL: z.string().default('file:./dev.db'),

    // Admin Seed
    ADMIN_EMAIL: z.string().email().default('admin@test.com'),
    ADMIN_PASSWORD: z.string().min(6).default('password123'),
    ADMIN_NAME: z.string().default('Administrador'),

    // Depix (optional for initial setup)
    DEPIX_API_URL: optionalEnvString,
    DEPIX_API_KEY: optionalEnvString,
    DEPIX_WEBHOOK_SECRET: optionalEnvString,

    // Telegram (optional for initial setup)
    TELEGRAM_API_ID: optionalEnvString,
    TELEGRAM_API_HASH: optionalEnvString,
    TELEGRAM_PHONE: optionalEnvString,

    // Notifications (optional)
    TELEGRAM_ADMIN_BOT_TOKEN: optionalEnvString,
    SMTP_HOST: optionalEnvString,
    SMTP_PORT: optionalEnvString,
    SMTP_USER: optionalEnvString,
    SMTP_PASS: optionalEnvString,
    MAIL_FROM: optionalEnvString,
    MAIL_TO_OVERRIDE: optionalEnvString,
});

function parseEnvironment() {
    const parsedEnvironment = envSchema.safeParse(process.env);

    if (parsedEnvironment.success) {
        return parsedEnvironment.data;
    }

    const fieldErrors = parsedEnvironment.error.flatten().fieldErrors;
    const details = JSON.stringify(fieldErrors, null, 2);

    throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
}

export const env = parseEnvironment();
