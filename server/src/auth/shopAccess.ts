import { Request, Response } from 'express';
import { db } from '../db/connection';

export function getAuthorizedShopId(req: Request, res: Response): number | undefined {
	const headerVal = (req.headers['x-shop-id'] || req.headers['x-shop'] || '') as string;
	const shopId = Number(headerVal);
	if (!shopId || Number.isNaN(shopId)) {
		res.status(400).json({ error: 'Missing X-Shop-Id header' });
		return undefined;
	}

	if (!req.user) {
		res.status(401).json({ error: 'Unauthorized' });
		return undefined;
	}

	if (req.user.role === 'admin') return shopId;

	const found = db
		.prepare('SELECT 1 FROM shop_users WHERE shop_id = ? AND user_id = ?')
		.get(shopId, req.user.userId);
	if (!found) {
		res.status(403).json({ error: 'Forbidden for this shop' });
		return undefined;
	}
	return shopId;
}


