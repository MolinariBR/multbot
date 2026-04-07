import type { FastifyPluginAsync } from 'fastify';
import { login } from './auth.service.js';
import {
    loginBodyJsonSchema,
    loginSchema,
    loginSuccessResponseJsonSchema,
} from './auth.schema.js';
import { ValidationError } from '../../lib/error.js';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

export const authRoutes: FastifyPluginAsync = async (app) => {
    app.post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'Login do administrador',
            body: loginBodyJsonSchema,
            response: {
                200: loginSuccessResponseJsonSchema,
            },
        },
    }, async (request, reply) => {
        const parsedLoginInput = loginSchema.safeParse(request.body);

        if (!parsedLoginInput.success) {
            const fieldErrors = normalizeFieldErrors(parsedLoginInput.error.flatten().fieldErrors);
            throw new ValidationError('Dados inválidos', fieldErrors);
        }

        const result = await login(parsedLoginInput.data);
        return reply.send(result);
    });
};
