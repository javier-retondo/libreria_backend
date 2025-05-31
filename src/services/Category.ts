import { Op } from 'sequelize';
import { Category, ICategory } from '../models';

const createCategory = async (
  nombre: string,
  descripcion: string,
): Promise<ICategory> => {
  const category = await Category.create({ nombre, descripcion });
  return category.dataValues;
};

const getCategoryById = async (id: number): Promise<ICategory> => {
  const category = await Category.findByPk(id);
  if (!category) {
    console.error(`Category with ID ${id} not found`);
    throw new Error(`Category with ID ${id} not found`);
  }
  return category.dataValues;
};

const updateCategory = async (
  id: number,
  categoryData: Partial<ICategory>,
): Promise<ICategory> => {
  const category = await Category.findByPk(id);
  if (!category) {
    console.error(`Category with ID ${id} not found`);
    throw new Error(`Category with ID ${id} not found`);
  }
  await category.update(categoryData);
  return category.dataValues;
};

const getCategories = async (
  pagination: {
    page: number;
    pageSize: number;
    sortBy: keyof ICategory;
    sortOrder: 'ASC' | 'DESC';
  },
  search?: string,
): Promise<{ rows: ICategory[]; count: number }> => {
  const {
    page = 1,
    pageSize = 10000,
    sortBy = 'id',
    sortOrder = 'ASC',
  } = pagination;

  const where: any = {};
  if (search) {
    where.nombre = { [Op.like]: `%${search}%` };
  }

  const categories = await Category.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }).then((result) => {
    if (!result || !result.rows || !result.count) {
      throw new Error('Error fetching categories');
    }
    return {
      rows: result.rows.map((category) => category.dataValues),
      count: result.count,
    };
  });

  return categories;
};

const deleteCategory = async (id: number): Promise<boolean> => {
  const category = await Category.findByPk(id);
  if (!category) {
    console.error(`Category with ID ${id} not found`);
    throw new Error(`Category with ID ${id} not found`);
  }
  await category.destroy();
  return true;
};

export {
  createCategory,
  getCategoryById,
  updateCategory,
  getCategories,
  deleteCategory,
};
