import { PrismaClient } from '@prisma/client';

type GlobalPrismaCache = {
    prisma?: PrismaClient;
};

const globalPrismaCache = globalThis as typeof globalThis & GlobalPrismaCache;
const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
const isProductionEnvironment = process.env.NODE_ENV === 'production';

function createPrismaClient(): PrismaClient {
    return new PrismaClient({
        log: isDevelopmentEnvironment ? ['query', 'error', 'warn'] : ['error'],
    });
}

export const prisma = globalPrismaCache.prisma ?? createPrismaClient();

if (!isProductionEnvironment) {
    globalPrismaCache.prisma = prisma;
}
