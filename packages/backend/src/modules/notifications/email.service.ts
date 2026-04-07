import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

type SmtpConfig = {
    host: string;
    port: number;
    smtpUser: string;
    smtpPassword: string;
    senderEmail: string;
};

type SendEmailInput = {
    to: string[];
    subject: string;
    text: string;
};

function getSmtpConfig(): SmtpConfig {
    const host = env.SMTP_HOST || '';
    const portStr = env.SMTP_PORT || '';
    const smtpUser = env.SMTP_USER || '';
    const smtpPassword = env.SMTP_PASS || '';
    const senderEmail = env.MAIL_FROM || '';

    const port = portStr ? Number(portStr) : NaN;

    return { host, port, smtpUser, smtpPassword, senderEmail };
}

function hasValidSmtpConfig(config: SmtpConfig): boolean {
    return Boolean(
        config.host
        && Number.isFinite(config.port)
        && config.smtpUser
        && config.smtpPassword
        && config.senderEmail,
    );
}

function assertSmtpConfigOrThrow(config: SmtpConfig): void {
    if (hasValidSmtpConfig(config)) {
        return;
    }

    throw new Error(
        'Email (SMTP) não configurado. Defina SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM.',
    );
}

function resolveRecipients(defaultRecipients: string[]): string[] {
    const overrideRecipient = env.MAIL_TO_OVERRIDE?.trim();
    const recipients = overrideRecipient ? [overrideRecipient] : defaultRecipients;

    return recipients.map((emailAddress) => emailAddress.trim()).filter(Boolean);
}

function createSmtpTransport(config: SmtpConfig) {
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.smtpUser, pass: config.smtpPassword },
    });
}

export function isEmailConfigured(): boolean {
    return hasValidSmtpConfig(getSmtpConfig());
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
    const smtpConfig = getSmtpConfig();
    assertSmtpConfigOrThrow(smtpConfig);

    const recipients = resolveRecipients(input.to);
    if (recipients.length === 0) {
        throw new Error('Nenhum destinatário de email válido foi informado.');
    }

    const smtpTransport = createSmtpTransport(smtpConfig);

    try {
        await smtpTransport.sendMail({
            from: smtpConfig.senderEmail,
            to: recipients,
            subject: input.subject,
            text: input.text,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
        throw new Error(`Falha ao enviar email para ${recipients.join(', ')}: ${errorMessage}`);
    }
}
