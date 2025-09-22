"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_1 = require("../db/connection");
const middleware_1 = require("../auth/middleware");
const shopAccess_1 = require("../auth/shopAccess");
const router = (0, express_1.Router)();
const createPaymentSchema = zod_1.z.object({
    amount_cents: zod_1.z.number().int().positive(),
    mode: zod_1.z.enum(['day', 'week', 'month']),
});
router.use(middleware_1.requireAuth);
// List payments for a shop
router.get('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const rows = connection_1.db
        .prepare(`SELECT id, amount_cents, mode, paid_at, validated_by_admin_id, status
			 FROM payments WHERE shop_id = ? ORDER BY paid_at DESC`)
        .all(shopId);
    res.json(rows);
});
// Create payment (shopkeeper)
router.post('/', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const parsed = createPaymentSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { amount_cents, mode } = parsed.data;
    const info = connection_1.db
        .prepare('INSERT INTO payments(shop_id, amount_cents, mode, status) VALUES(?,?,?,"pending")')
        .run(shopId, amount_cents, mode);
    res.status(201).json({ id: info.lastInsertRowid, amount_cents, mode, status: 'pending' });
});
// Admin: validate a payment and update/create subscription window
router.post('/:id/validate', (0, middleware_1.requireRole)('admin'), (req, res) => {
    const id = Number(req.params.id);
    const payment = connection_1.db
        .prepare('SELECT id, shop_id, mode, status FROM payments WHERE id = ?')
        .get(id);
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending')
        return res.status(400).json({ error: 'Payment already processed' });
    // Compute expiry based on mode
    const addExpr = payment.mode === 'day' ?
        "DATE(started_at, '+1 day')" : payment.mode === 'week' ?
        "DATE(started_at, '+7 day')" : "DATE(started_at, '+1 month')";
    // Determine start time: now or extend from current active subscription
    const current = connection_1.db
        .prepare(`SELECT id, started_at, expires_at, status FROM subscriptions
			 WHERE shop_id = ? AND status = 'active'
			 ORDER BY expires_at DESC LIMIT 1`)
        .get(payment.shop_id);
    if (current) {
        // extend from current.expires_at
        connection_1.db.prepare('UPDATE subscriptions SET expires_at = ' + addExpr + ' WHERE id = ?')
            .run(current.id);
    }
    else {
        // create fresh subscription starting now
        connection_1.db.prepare(`INSERT INTO subscriptions(shop_id, mode, started_at, expires_at, status)
			 VALUES(?, ?, datetime('now'), CASE ? WHEN 'day' THEN datetime('now','+1 day') WHEN 'week' THEN datetime('now','+7 day') ELSE datetime('now','+1 month') END, 'active')`)
            .run(payment.shop_id, payment.mode, payment.mode);
    }
    // mark payment validated
    connection_1.db.prepare('UPDATE payments SET status = "validated", validated_by_admin_id = ? WHERE id = ?').run(req.user.userId, id);
    res.json({ id, status: 'validated' });
});
// Admin: reject a payment
router.post('/:id/reject', (0, middleware_1.requireRole)('admin'), (req, res) => {
    const id = Number(req.params.id);
    const payment = connection_1.db
        .prepare('SELECT id, status FROM payments WHERE id = ?')
        .get(id);
    if (!payment)
        return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending')
        return res.status(400).json({ error: 'Payment already processed' });
    connection_1.db.prepare('UPDATE payments SET status = "rejected" WHERE id = ?').run(id);
    res.json({ id, status: 'rejected' });
});
exports.default = router;
