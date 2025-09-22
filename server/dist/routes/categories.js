"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_1 = require("../db/connection");
const middleware_1 = require("../auth/middleware");
const shopAccess_1 = require("../auth/shopAccess");
const router = (0, express_1.Router)();
const upsertSchema = zod_1.z.object({ name: zod_1.z.string().min(1) });
router.use(middleware_1.requireAuth);
router.get('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const rows = connection_1.db.prepare('SELECT id, name FROM categories WHERE shop_id = ? ORDER BY name').all(shopId);
    res.json(rows);
});
router.post('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    try {
        const info = connection_1.db.prepare('INSERT INTO categories(shop_id, name) VALUES(?, ?)').run(shopId, parsed.data.name);
        res.status(201).json({ id: info.lastInsertRowid, name: parsed.data.name });
    }
    catch (e) {
        res.status(400).json({ error: 'Category exists' });
    }
});
router.put('/:id', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const id = Number(req.params.id);
    connection_1.db.prepare('UPDATE categories SET name = ? WHERE id = ? AND shop_id = ?').run(parsed.data.name, id, shopId);
    res.json({ id, name: parsed.data.name });
});
router.delete('/:id', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const id = Number(req.params.id);
    connection_1.db.prepare('DELETE FROM categories WHERE id = ? AND shop_id = ?').run(id, shopId);
    res.status(204).end();
});
exports.default = router;
