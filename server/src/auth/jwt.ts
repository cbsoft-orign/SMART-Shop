import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = { userId: number; role: 'admin' | 'shopkeeper' };

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
	return jwt.verify(token, env.jwtSecret) as JwtPayload;
}


