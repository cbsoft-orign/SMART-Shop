"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const connection_1 = require("../db/connection");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../auth/jwt");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
router.post('/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { email, password } = parsed.data;
    const user = connection_1.db
        .prepare('SELECT id, password_hash, role FROM users WHERE email = ?')
        .get(email);
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt_1.default.compareSync(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = (0, jwt_1.signToken)({ userId: user.id, role: user.role });
    return res.json({ token });
});
exports.default = router;
