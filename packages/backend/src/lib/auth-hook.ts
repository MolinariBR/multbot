import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from './jwt.js';
import { UnauthorizedError } from './error.js';

const PUBLIC_ROUTE_PREFIXES = [
    '/api/auth/login',
    '/api/depix/webhook',
    '/health',
    '/docs',
    '/docs/json',
];

function getRequestPath(url: string): string {
    return url.split('?')[0];
}

function isPublicRoute(url: string): boolean {
    const requestPath = getRequestPath(url);

    return PUBLIC_ROUTE_PREFIXES.some((routePrefix) => (
        requestPath === routePrefix || requestPath.startsWith(`${routePrefix}/`)
    ));
}

function extractBearerToken(authorizationHeader?: string): string {
    if (!authorizationHeader) {
        throw new UnauthorizedError('Token obrigatório');
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError('Formato de token inválido');
    }

    return token;
}

export async function authHook(request: FastifyRequest, _reply: FastifyReply) {
    if (isPublicRoute(request.url)) {
        return;
    }

    const token = extractBearerToken(request.headers.authorization);

    try {
        request.user = verifyToken(token);
    } catch {
        throw new UnauthorizedError(`Token inválido ou expirado em ${request.method} ${request.url}`);
    }
}
