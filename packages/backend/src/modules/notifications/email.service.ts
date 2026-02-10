import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

function getSmtpConfig() {
    const host = env.SMTP_HOST || '';
    const portStr = env.SMTP_PORT || '';
    const user = env.SMTP_USER || '';
    const pass = env.SMTP_PASS || '';
    const from = env.MAIL_FROM || '';

    const port = portStr ? Number(portStr) : NaN;

    return { host, port, user, pass, from };
}

export function isEmailConfigured(): boolean {
    const { host, port, user, pass, from } = getSmtpConfig();
    return Boolean(host && Number.isFinite(port) && user && pass && from);
}

export async function sendEmail(params: {
    to: string[];
    subject: string;
    text: string;
}): Promise<void> {
    const { host, port, user, pass, from } = getSmtpConfig();

    if (!isEmailConfigured()) {
        throw new Error('Email (SMTP) não configurado. Defina SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/MAIL_FROM.');
    }

    const transport = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    const to = (env.MAIL_TO_OVERRIDE ? [env.MAIL_TO_OVERRIDE] : params.to).filter(Boolean);
    if (to.length === 0) return;

    await transport.sendMail({
        from,
        to,
        subject: params.subject,
        text: params.text,
    });
}

