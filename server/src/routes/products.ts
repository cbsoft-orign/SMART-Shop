import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import { requireAuth } from '../auth/middleware';
import { getAuthorizedShopId } from '../auth/shopAccess';

const router = Router();

const upsertSchema = z.object({
	name: z.string().min(1),
	price_cents: z.number().int().nonnegative(),
	category_id: z.number().int().optional(),
});

router.use(requireAuth);

router.get('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const rows = db
		.prepare(
			`SELECT p.id, p.name, p.price_cents, p.stock, p.category_id, c.name as category_name
			 FROM products p LEFT JOIN categories c ON c.id = p.category_id
			 WHERE p.shop_id = ? ORDER BY p.name`
		)
		.all(shopId);
	res.json(rows);
});

router.post('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const info = db
		.prepare('INSERT INTO products(shop_id, category_id, name, price_cents, stock) VALUES(?,?,?,?,0)')
		.run(shopId, parsed.data.category_id ?? null, parsed.data.name, parsed.data.price_cents);
	res.status(201).json({ id: info.lastInsertRowid, ...parsed.data, stock: 0 });
});

router.put('/:id', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const id = Number(req.params.id);
	db.prepare('UPDATE products SET name=?, price_cents=?, category_id=? WHERE id=? AND shop_id=?').run(
		parsed.data.name,
		parsed.data.price_cents,
		parsed.data.category_id ?? null,
		id,
		shopId
	);
	res.json({ id, ...parsed.data });
});

router.delete('/:id', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const id = Number(req.params.id);
	db.prepare('DELETE FROM products WHERE id = ? AND shop_id = ?').run(id, shopId);
	res.status(204).end();
});

export default router;


