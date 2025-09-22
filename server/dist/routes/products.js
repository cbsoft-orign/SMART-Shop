"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_1 = require("../db/connection");
const middleware_1 = require("../auth/middleware");
const shopAccess_1 = require("../auth/shopAccess");
const router = (0, express_1.Router)();
const upsertSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    price_cents: zod_1.z.number().int().nonnegative(),
    category_id: zod_1.z.number().int().optional(),
});
router.use(middleware_1.requireAuth);
router.get('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const rows = connection_1.db
        .prepare(`SELECT p.id, p.name, p.price_cents, p.stock, p.category_id, c.name as category_name
			 FROM products p LEFT JOIN categories c ON c.id = p.category_id
			 WHERE p.shop_id = ? ORDER BY p.name`)
        .all(shopId);
    res.json(rows);
});
router.post('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const info = connection_1.db
        .prepare('INSERT INTO products(shop_id, category_id, name, price_cents, stock) VALUES(?,?,?,?,0)')
        .run(shopId, parsed.data.category_id ?? null, parsed.data.name, parsed.data.price_cents);
    res.status(201).json({ id: info.lastInsertRowid, ...parsed.data, stock: 0 });
});
router.put('/:id', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const id = Number(req.params.id);
    connection_1.db.prepare('UPDATE products SET name=?, price_cents=?, category_id=? WHERE id=? AND shop_id=?').run(parsed.data.name, parsed.data.price_cents, parsed.data.category_id ?? null, id, shopId);
    res.json({ id, ...parsed.data });
});
router.delete('/:id', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const id = Number(req.params.id);
    connection_1.db.prepare('DELETE FROM products WHERE id = ? AND shop_id = ?').run(id, shopId);
    res.status(204).end();
});
exports.default = router;
