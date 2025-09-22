import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import { requireAuth } from '../auth/middleware';
import { getAuthorizedShopId } from '../auth/shopAccess';

const router = Router();

const moveSchema = z.object({ product_id: z.number().int(), type: z.enum(['in', 'out']), quantity: z.number().int().positive(), note: z.string().optional() });

router.use(requireAuth);

router.get('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const rows = db
		.prepare(
			`SELECT sm.id, sm.product_id, p.name as product_name, sm.type, sm.quantity, sm.note, sm.created_at
			 FROM stock_movements sm JOIN products p ON p.id = sm.product_id
			 WHERE sm.shop_id = ? ORDER BY sm.created_at DESC LIMIT 200`
		)
		.all(shopId);
	res.json(rows);
});

type ProductRow = { id: number; stock: number };

router.post('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = moveSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const { product_id, type, quantity, note } = parsed.data;
	const product = db
		.prepare('SELECT id, stock FROM products WHERE id = ? AND shop_id = ?')
		.get(product_id, shopId) as ProductRow | undefined;
	if (!product) return res.status(404).json({ error: 'Product not found' });
	let newStock = product.stock;
	newStock = type === 'in' ? newStock + quantity : newStock - quantity;
	if (newStock < 0) return res.status(400).json({ error: 'Insufficient stock' });
	db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, product_id);
	db.prepare('INSERT INTO stock_movements(shop_id, product_id, type, quantity, note) VALUES(?,?,?,?,?)').run(shopId, product_id, type, quantity, note ?? null);
	res.status(201).json({ product_id, type, quantity, note: note ?? null, stock: newStock });
});

export default router;


