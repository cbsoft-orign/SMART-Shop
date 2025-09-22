import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import { requireAuth } from '../auth/middleware';
import { getAuthorizedShopId } from '../auth/shopAccess';

const router = Router();

const upsertSchema = z.object({ name: z.string().min(1) });

router.use(requireAuth);

router.get('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const rows = db.prepare('SELECT id, name FROM categories WHERE shop_id = ? ORDER BY name').all(shopId);
	res.json(rows);
});

router.post('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	try {
		const info = db.prepare('INSERT INTO categories(shop_id, name) VALUES(?, ?)').run(shopId, parsed.data.name);
		res.status(201).json({ id: info.lastInsertRowid, name: parsed.data.name });
	} catch (e) {
		res.status(400).json({ error: 'Category exists' });
	}
});

router.put('/:id', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = upsertSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const id = Number(req.params.id);
	db.prepare('UPDATE categories SET name = ? WHERE id = ? AND shop_id = ?').run(parsed.data.name, id, shopId);
	res.json({ id, name: parsed.data.name });
});

router.delete('/:id', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const id = Number(req.params.id);
	db.prepare('DELETE FROM categories WHERE id = ? AND shop_id = ?').run(id, shopId);
	res.status(204).end();
});

export default router;


