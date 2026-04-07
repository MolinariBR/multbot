import { randomBytes } from 'crypto';
import { prisma } from '../../../lib/prisma.js';

export async function createTelegramPairingCode(
    adminId: string,
): Promise<{ code: string; expiresAt: Date }> {
    await prisma.adminTelegramPairing.updateMany({
        where: {
            adminId,
            usedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        data: {
            usedAt: new Date(),
        },
    });

    const code = randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.adminTelegramPairing.create({
        data: {
            adminId,
            code,
            expiresAt,
        },
    });

    return { code, expiresAt };
}
