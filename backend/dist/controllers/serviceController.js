"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceDetails = exports.createService = exports.getServicesByCategory = exports.createCategory = exports.getCategories = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getCategories = async (req, res, next) => {
    const categories = await db_1.default.category.findMany({
        orderBy: { name: 'asc' },
    });
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: categories,
    });
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    const { name, iconName, description } = req.body;
    if (!name || !iconName) {
        return next(new errors_1.AppError('Category name and iconName are required', 400));
    }
    const category = await db_1.default.category.create({
        data: { name, iconName, description },
    });
    res.status(201).json({
        status: 'success',
        data: category,
    });
};
exports.createCategory = createCategory;
const getServicesByCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const services = await db_1.default.service.findMany({
        where: { categoryId },
        orderBy: { title: 'asc' },
    });
    res.status(200).json({
        status: 'success',
        results: services.length,
        data: services,
    });
};
exports.getServicesByCategory = getServicesByCategory;
const createService = async (req, res, next) => {
    const { categoryId, title, description, durationMins, basePrice, discountPrice, checklist } = req.body;
    if (!categoryId || !title || !description || !durationMins || !basePrice) {
        return next(new errors_1.AppError('Required fields: categoryId, title, description, durationMins, basePrice', 400));
    }
    const categoryExists = await db_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!categoryExists) {
        return next(new errors_1.AppError('Category not found', 404));
    }
    const service = await db_1.default.service.create({
        data: {
            categoryId,
            title,
            description,
            durationMins: parseInt(durationMins, 10),
            basePrice,
            discountPrice,
            checklist: checklist || [], // Stored as JSON Array
        },
    });
    res.status(201).json({
        status: 'success',
        data: service,
    });
};
exports.createService = createService;
const getServiceDetails = async (req, res, next) => {
    const { id } = req.params;
    const service = await db_1.default.service.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!service) {
        return next(new errors_1.AppError('Service not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: service,
    });
};
exports.getServiceDetails = getServiceDetails;
