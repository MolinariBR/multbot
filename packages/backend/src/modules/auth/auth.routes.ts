import type { FastifyPluginAsync } from 'fastify';
import { loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';
import { ValidationError } from '../../lib/error.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
    app.post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'Login do administrador',
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        admin: {
                            type: 'object',
                            properties: {
                                email: { type: 'string' },
                                name: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const parsed = loginSchema.safeParse(request.body);

        if (!parsed.success) {
            throw new ValidationError('Dados inválidos', parsed.error.flatten().fieldErrors as any);
        }

        const result = await authService.login(parsed.data);
        return reply.send(result);
    });
};
