import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from './jwt.js';
import { UnauthorizedError } from './error.js';

// Rotas que não precisam de autenticação
const publicRoutes = [
    '/api/auth/login',
    '/api/depix/webhook',
    '/health',
    '/docs',
    '/docs/json',
];

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
    const { url } = request;

    // Ignorar rotas públicas
    if (publicRoutes.some(route => url.startsWith(route))) {
        return;
    }

    // Extrair token do header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        throw new UnauthorizedError('Token obrigatório');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError('Formato de token inválido');
    }

    try {
        const payload = verifyToken(token);
        // Adicionar payload ao request para uso posterior
        (request as any).user = payload;
    } catch (error) {
        throw new UnauthorizedError('Token inválido ou expirado');
    }
}
