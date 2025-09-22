import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from './jwt';

declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = verifyToken(token);
		req.user = payload;
		next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

export function requireRole(role: 'admin' | 'shopkeeper') {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
		next();
	};
}


