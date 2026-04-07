import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginBodyJsonSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
    },
} as const;

export const loginSuccessResponseJsonSchema = {
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
} as const;

export type LoginInput = z.infer<typeof loginSchema>;
