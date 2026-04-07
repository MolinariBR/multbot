import { prisma } from '../../lib/prisma.js';
import { comparePassword } from '../../lib/hash.js';
import { signToken } from '../../lib/jwt.js';
import { UnauthorizedError } from '../../lib/error.js';
import type { LoginInput } from './auth.schema.js';

const INVALID_CREDENTIALS_ERROR_MESSAGE = 'Email ou senha inválidos';

interface AdminForLogin {
    id: string;
    email: string;
    password: string;
    name: string;
}

async function findAdminForLogin(email: string): Promise<AdminForLogin> {
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
        throw new UnauthorizedError(INVALID_CREDENTIALS_ERROR_MESSAGE);
    }

    return admin;
}

async function validatePasswordOrThrow(plainPassword: string, hashedPassword: string): Promise<void> {
    const isPasswordValid = await comparePassword(plainPassword, hashedPassword);

    if (!isPasswordValid) {
        throw new UnauthorizedError(INVALID_CREDENTIALS_ERROR_MESSAGE);
    }
}

function buildLoginResponse(admin: Pick<AdminForLogin, 'id' | 'email' | 'name'>) {
    return {
        accessToken: signToken({
            sub: admin.id,
            email: admin.email,
        }),
        admin: {
            email: admin.email,
            name: admin.name,
        },
    };
}

export async function login(input: LoginInput) {
    const { email, password } = input;
    const admin = await findAdminForLogin(email);
    await validatePasswordOrThrow(password, admin.password);
    return buildLoginResponse(admin);
}
