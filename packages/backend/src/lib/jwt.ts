import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}

function isJwtPayload(payload: unknown): payload is JwtPayload {
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    const payloadData = payload as Record<string, unknown>;
    return typeof payloadData.sub === 'string' && typeof payloadData.email === 'string';
}

function resolveTokenExpiration(): jwt.SignOptions['expiresIn'] {
    const expiration = env.JWT_EXPIRES_IN.trim();

    if (!expiration) {
        throw new Error('JWT_EXPIRES_IN inválido: valor vazio');
    }

    return expiration as jwt.SignOptions['expiresIn'];
}

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const options: jwt.SignOptions = {
        expiresIn: resolveTokenExpiration(),
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (!isJwtPayload(payload)) {
        throw new Error('Token JWT inválido: payload fora do formato esperado');
    }

    return payload;
}

export function decodeToken(token: string): JwtPayload | null {
    const decodedPayload = jwt.decode(token);
    return isJwtPayload(decodedPayload) ? decodedPayload : null;
}
