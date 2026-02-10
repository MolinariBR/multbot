import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    // Server
    PORT: z.string().default('3000').transform(Number),
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
    DEPIX_API_URL: z.string().optional().or(z.literal('')),
    DEPIX_API_KEY: z.string().optional().or(z.literal('')),
    DEPIX_WEBHOOK_SECRET: z.string().optional().or(z.literal('')),

    // Telegram (optional for initial setup)
    TELEGRAM_API_ID: z.string().optional().or(z.literal('')),
    TELEGRAM_API_HASH: z.string().optional().or(z.literal('')),
    TELEGRAM_PHONE: z.string().optional().or(z.literal('')),

    // Notifications (optional)
    TELEGRAM_ADMIN_BOT_TOKEN: z.string().optional().or(z.literal('')),
    SMTP_HOST: z.string().optional().or(z.literal('')),
    SMTP_PORT: z.string().optional().or(z.literal('')),
    SMTP_USER: z.string().optional().or(z.literal('')),
    SMTP_PASS: z.string().optional().or(z.literal('')),
    MAIL_FROM: z.string().optional().or(z.literal('')),
    MAIL_TO_OVERRIDE: z.string().optional().or(z.literal('')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
