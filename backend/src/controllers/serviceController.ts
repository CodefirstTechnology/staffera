import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AppError } from '../utils/errors';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: categories,
  });
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, iconName, description } = req.body;

  if (!name || !iconName) {
    return next(new AppError('Category name and iconName are required', 400));
  }

  const category = await prisma.category.create({
    data: { name, iconName, description },
  });

  res.status(201).json({
    status: 'success',
    data: category,
  });
};

export const getServicesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { categoryId } = req.params;

  const services = await prisma.service.findMany({
    where: { categoryId },
    orderBy: { title: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: services,
  });
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  const { categoryId, title, description, durationMins, basePrice, discountPrice, checklist } = req.body;

  if (!categoryId || !title || !description || !durationMins || !basePrice) {
    return next(new AppError('Required fields: categoryId, title, description, durationMins, basePrice', 400));
  }

  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  const service = await prisma.service.create({
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

export const getServiceDetails = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: service,
  });
};
