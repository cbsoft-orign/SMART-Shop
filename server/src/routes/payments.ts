import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import { requireAuth, requireRole } from '../auth/middleware';
import { getAuthorizedShopId } from '../auth/shopAccess';

const router = Router();

const createPaymentSchema = z.object({
	amount_cents: z.number().int().positive(),
	mode: z.enum(['day', 'week', 'month']),
});

router.use(requireAuth);

// List payments for a shop
router.get('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const rows = db
		.prepare(
			`SELECT id, amount_cents, mode, paid_at, validated_by_admin_id, status
			 FROM payments WHERE shop_id = ? ORDER BY paid_at DESC`
		)
		.all(shopId);
	res.json(rows);
});

// Create payment (shopkeeper)
router.post('/', (req, res) => {
	const shopId = getAuthorizedShopId(req, res);
	if (!shopId) return;
	const parsed = createPaymentSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const { amount_cents, mode } = parsed.data;
	const info = db
		.prepare('INSERT INTO payments(shop_id, amount_cents, mode, status) VALUES(?,?,?,"pending")')
		.run(shopId, amount_cents, mode);
	res.status(201).json({ id: info.lastInsertRowid, amount_cents, mode, status: 'pending' });
});

// Admin: validate a payment and update/create subscription window
router.post('/:id/validate', requireRole('admin'), (req, res) => {
	const id = Number(req.params.id);
	const payment = db
		.prepare('SELECT id, shop_id, mode, status FROM payments WHERE id = ?')
		.get(id) as { id: number; shop_id: number; mode: 'day' | 'week' | 'month'; status: string } | undefined;
	if (!payment) return res.status(404).json({ error: 'Payment not found' });
	if (payment.status !== 'pending') return res.status(400).json({ error: 'Payment already processed' });

	// Compute expiry based on mode
	const addExpr = payment.mode === 'day' ? 
		"DATE(started_at, '+1 day')" : payment.mode === 'week' ? 
		"DATE(started_at, '+7 day')" : "DATE(started_at, '+1 month')";

	// Determine start time: now or extend from current active subscription
	const current = db
		.prepare(
			`SELECT id, started_at, expires_at, status FROM subscriptions
			 WHERE shop_id = ? AND status = 'active'
			 ORDER BY expires_at DESC LIMIT 1`
		)
		.get(payment.shop_id) as { id: number; started_at: string; expires_at: string; status: string } | undefined;

	if (current) {
		// extend from current.expires_at
		db.prepare('UPDATE subscriptions SET expires_at = ' + addExpr + ' WHERE id = ?')
			.run(current.id);
	} else {
		// create fresh subscription starting now
		db.prepare(
			`INSERT INTO subscriptions(shop_id, mode, started_at, expires_at, status)
			 VALUES(?, ?, datetime('now'), CASE ? WHEN 'day' THEN datetime('now','+1 day') WHEN 'week' THEN datetime('now','+7 day') ELSE datetime('now','+1 month') END, 'active')`
		)
			.run(payment.shop_id, payment.mode, payment.mode);
	}

	// mark payment validated
	db.prepare(
		'UPDATE payments SET status = "validated", validated_by_admin_id = ? WHERE id = ?'
	).run(req.user!.userId, id);

	res.json({ id, status: 'validated' });
});

// Admin: reject a payment
router.post('/:id/reject', requireRole('admin'), (req, res) => {
	const id = Number(req.params.id);
	const payment = db
		.prepare('SELECT id, status FROM payments WHERE id = ?')
		.get(id) as { id: number; status: string } | undefined;
	if (!payment) return res.status(404).json({ error: 'Payment not found' });
	if (payment.status !== 'pending') return res.status(400).json({ error: 'Payment already processed' });
	db.prepare('UPDATE payments SET status = "rejected" WHERE id = ?').run(id);
	res.json({ id, status: 'rejected' });
});

export default router;


