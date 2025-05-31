import { Op } from 'sequelize';
import { Author, IAuthor } from '../models';

const createAuthor = async (
  nombre: string,
  biografia: string,
  fecha_nacimiento: Date,
  nacionalidad: string,
): Promise<IAuthor> => {
  return await Author.create({
    nombre,
    biografia,
    fecha_nacimiento,
    nacionalidad,
  }).then((author) => {
    if (!author || !author.dataValues || !author.dataValues.id) {
      throw new Error('Error creating author');
    }
    return author.dataValues;
  });
};

const getAuthorById = async (id: number): Promise<IAuthor> => {
  const author = await Author.findByPk(id);
  if (!author) {
    console.error(`Author with ID ${id} not found`);
    throw new Error(`Author with ID ${id} not found`);
  }
  return author.dataValues;
};

const updateAuthor = async (
  id: number,
  authorData: Partial<IAuthor>,
): Promise<IAuthor> => {
  const author = await Author.findByPk(id);
  if (!author) {
    console.error(`Author with ID ${id} not found`);
    throw new Error(`Author with ID ${id} not found`);
  }
  await author.update(authorData);
  return author.dataValues;
};

const getAuthors = async (
  pagination: {
    page: number;
    pageSize: number;
    sortBy: keyof IAuthor;
    sortOrder: 'ASC' | 'DESC';
  },
  search?: string,
): Promise<{ rows: IAuthor[]; count: number }> => {
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

  return await Author.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }).then((result) => {
    if (!result || !result.rows || !result.count) {
      throw new Error('Error fetching authors');
    }
    return {
      rows: result.rows.map((author) => author.dataValues),
      count: result.count,
    };
  });
};

const deleteAuthor = async (id: number): Promise<void> => {
  const author = await Author.findByPk(id);
  if (!author) {
    console.error(`Author with ID ${id} not found`);
    throw new Error(`Author with ID ${id} not found`);
  }
  await author.destroy();
};

export { createAuthor, getAuthorById, updateAuthor, getAuthors, deleteAuthor };
