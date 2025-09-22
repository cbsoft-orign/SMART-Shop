"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const migrations_1 = require("./db/migrations");
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const stock_1 = __importDefault(require("./routes/stock"));
const payments_1 = __importDefault(require("./routes/payments"));
const reports_1 = __importDefault(require("./routes/reports"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/auth', auth_1.default);
app.use('/categories', categories_1.default);
app.use('/products', products_1.default);
app.use('/stock', stock_1.default);
app.use('/payments', payments_1.default);
app.use('/reports', reports_1.default);
(0, migrations_1.runMigrations)();
app.listen(env_1.env.port, () => {
    console.log(`API listening on http://localhost:${env_1.env.port}`);
});
