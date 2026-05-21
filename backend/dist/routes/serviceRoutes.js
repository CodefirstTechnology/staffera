"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes (anyone authenticated can view)
router.get('/categories', serviceController_1.getCategories);
router.get('/categories/:categoryId/services', serviceController_1.getServicesByCategory);
router.get('/services/:id', serviceController_1.getServiceDetails);
// Admin restricted operations
router.post('/categories', auth_1.authenticate, (0, auth_1.restrictTo)('ADMIN'), serviceController_1.createCategory);
router.post('/services', auth_1.authenticate, (0, auth_1.restrictTo)('ADMIN'), serviceController_1.createService);
exports.default = router;
