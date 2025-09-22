import { Router } from 'express';
import { db } from '../db/connection';
import { requireAuth } from '../auth/middleware';
import { getAuthorizedShopId } from '../auth/shopAccess';

const router = Router();

router.use(requireAuth);

function totals(shopId: number, fromExpr: string) {
	return db
		.prepare(
			`SELECT 
				SUM(CASE WHEN type='in' THEN quantity ELSE 0 END) as total_in,
				SUM(CASE WHEN type='out' THEN quantity ELSE 0 END) as total_out
			 FROM stock_movements
			 WHERE shop_id = ? AND datetime(created_at) >= ${fromExpr}`
		)
		.get(shopId) as { total_in: number | null; total_out: number | null };
}

router.get('/day', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const t = totals(shopId, "datetime('now','-1 day')");
	res.json({ period: 'day', ...t });
});

router.get('/week', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const t = totals(shopId, "datetime('now','-7 day')");
	res.json({ period: 'week', ...t });
});

router.get('/month', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const t = totals(shopId, "datetime('now','-1 month')");
	res.json({ period: 'month', ...t });
});

router.get('/year', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const t = totals(shopId, "datetime('now','-1 year')");
	res.json({ period: 'year', ...t });
});

export default router;


