"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const middleware_1 = require("../auth/middleware");
const shopAccess_1 = require("../auth/shopAccess");
const router = (0, express_1.Router)();
router.use(middleware_1.requireAuth);
function totals(shopId, fromExpr) {
    return connection_1.db
        .prepare(`SELECT 
				SUM(CASE WHEN type='in' THEN quantity ELSE 0 END) as total_in,
				SUM(CASE WHEN type='out' THEN quantity ELSE 0 END) as total_out
			 FROM stock_movements
			 WHERE shop_id = ? AND datetime(created_at) >= ${fromExpr}`)
        .get(shopId);
}
router.get('/day', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const t = totals(shopId, "datetime('now','-1 day')");
    res.json({ period: 'day', ...t });
});
router.get('/week', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const t = totals(shopId, "datetime('now','-7 day')");
    res.json({ period: 'week', ...t });
});
router.get('/month', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const t = totals(shopId, "datetime('now','-1 month')");
    res.json({ period: 'month', ...t });
});
router.get('/year', (req, res) => {
    const shopId = (0, shopAccess_1.getAuthorizedShopId)(req, res);
    if (!shopId)
        return;
    const t = totals(shopId, "datetime('now','-1 year')");
    res.json({ period: 'year', ...t });
});
exports.default = router;
