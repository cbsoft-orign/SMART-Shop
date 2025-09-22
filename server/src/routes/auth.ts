import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/connection';
import bcrypt from 'bcrypt';
import { signToken } from '../auth/jwt';

const router = Router();

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

type UserRow = { id: number; password_hash: string; role: 'admin' | 'shopkeeper' };

router.post('/login', (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
	const { email, password } = parsed.data;
	const user = db
		.prepare('SELECT id, password_hash, role FROM users WHERE email = ?')
		.get(email) as UserRow | undefined;
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const ok = bcrypt.compareSync(password, user.password_hash);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
	const token = signToken({ userId: user.id, role: user.role });
	return res.json({ token });
});

export default router;


