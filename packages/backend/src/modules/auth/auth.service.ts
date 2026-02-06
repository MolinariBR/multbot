import { prisma } from '../../lib/prisma.js';
import { comparePassword } from '../../lib/hash.js';
import { signToken } from '../../lib/jwt.js';
import { UnauthorizedError } from '../../lib/error.js';
import type { LoginInput } from './auth.schema.js';

export async function login(input: LoginInput) {
    const { email, password } = input;

    // Buscar admin por email
    const admin = await prisma.admin.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
        },
    });

    if (!admin) {
        throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Verificar senha
    const isValid = await comparePassword(password, admin.password);

    if (!isValid) {
        throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Gerar token
    const accessToken = signToken({
        sub: admin.id,
        email: admin.email,
    });

    return {
        accessToken,
        admin: {
            email: admin.email,
            name: admin.name,
        },
    };
}
