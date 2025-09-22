import { db } from './connection';
import bcrypt from 'bcrypt';

export function runMigrations() {
	// migrations table
	db.prepare(
		`CREATE TABLE IF NOT EXISTS _migrations (
			id INTEGER PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			applied_at TEXT NOT NULL
		)`
	).run();

	const hasRun = (name: string) => {
		return (
			db
				.prepare('SELECT 1 FROM _migrations WHERE name = ? LIMIT 1')
				.get(name) !== undefined
		);
	};

	const markRun = (name: string) => {
		db.prepare('INSERT INTO _migrations(name, applied_at) VALUES(?, datetime("now"))').run(name);
	};

	// 001 initial schema
	if (!hasRun('001_initial')) {
		db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL CHECK(role IN ('admin','shopkeeper')),
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS shops (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			owner_user_id INTEGER NOT NULL,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS shop_users (
			shop_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			PRIMARY KEY(shop_id, user_id),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
			FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY,
			shop_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			UNIQUE(shop_id, name),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY,
			shop_id INTEGER NOT NULL,
			category_id INTEGER,
			name TEXT NOT NULL,
			price_cents INTEGER NOT NULL,
			stock INTEGER NOT NULL DEFAULT 0,
			UNIQUE(shop_id, name),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
			FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
		);

		CREATE TABLE IF NOT EXISTS stock_movements (
			id INTEGER PRIMARY KEY,
			shop_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('in','out')),
			quantity INTEGER NOT NULL,
			note TEXT,
			created_at TEXT NOT NULL DEFAULT (datetime('now')),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
			FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS subscriptions (
			id INTEGER PRIMARY KEY,
			shop_id INTEGER NOT NULL,
			mode TEXT NOT NULL CHECK(mode IN ('day','week','month')),
			started_at TEXT NOT NULL,
			expires_at TEXT NOT NULL,
			status TEXT NOT NULL CHECK(status IN ('active','expired','pending')),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS payments (
			id INTEGER PRIMARY KEY,
			shop_id INTEGER NOT NULL,
			amount_cents INTEGER NOT NULL,
			mode TEXT NOT NULL CHECK(mode IN ('day','week','month')),
			paid_at TEXT NOT NULL DEFAULT (datetime('now')),
			validated_by_admin_id INTEGER,
			status TEXT NOT NULL CHECK(status IN ('pending','validated','rejected')),
			FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
			FOREIGN KEY(validated_by_admin_id) REFERENCES users(id) ON DELETE SET NULL
		);
		`);

		// seed admin
		const adminEmail = 'admin@smartshop.local';
		const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
		if (!exists) {
			const hash = bcrypt.hashSync('admin123', 10);
			const info = db
				.prepare('INSERT INTO users(email, password_hash, role) VALUES(?,?,?)')
				.run(adminEmail, hash, 'admin');
			console.log('Seeded admin user with id', info.lastInsertRowid);
		}

		markRun('001_initial');
	}
}


