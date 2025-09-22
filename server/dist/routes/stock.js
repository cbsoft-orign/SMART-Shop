"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_1 = require("../db/connection");
const middleware_1 = require("../auth/middleware");
const shopAccess_1 = require("../auth/shopAccess");
const router = (0, express_1.Router)();
const moveSchema = zod_1.z.object({ product_id: zod_1.z.number().int(), type: zod_1.z.enum(['in', 'out']), quantity: zod_1.z.number().int().positive(), note: zod_1.z.string().optional() });
router.use(middleware_1.requireAuth);
router.get('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const rows = connection_1.db
        .prepare(`SELECT sm.id, sm.product_id, p.name as product_name, sm.type, sm.quantity, sm.note, sm.created_at
			 FROM stock_movements sm JOIN products p ON p.id = sm.product_id
			 WHERE sm.shop_id = ? ORDER BY sm.created_at DESC LIMIT 200`)
        .all(shopId);
    res.json(rows);
});
router.post('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = moveSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { product_id, type, quantity, note } = parsed.data;
    const product = connection_1.db
        .prepare('SELECT id, stock FROM products WHERE id = ? AND shop_id = ?')
        .get(product_id, shopId);
    if (!product)
        return res.status(404).json({ error: 'Product not found' });
    let newStock = product.stock;
    newStock = type === 'in' ? newStock + quantity : newStock - quantity;
    if (newStock < 0)
        return res.status(400).json({ error: 'Insufficient stock' });
    connection_1.db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, product_id);
    connection_1.db.prepare('INSERT INTO stock_movements(shop_id, product_id, type, quantity, note) VALUES(?,?,?,?,?)').run(shopId, product_id, type, quantity, note ?? null);
    res.status(201).json({ product_id, type, quantity, note: note ?? null, stock: newStock });
});
exports.default = router;
