import { FindOptions, WhereOptions } from 'sequelize';
import { Author, Book, Category, IBook } from '../models';
import { Op } from 'sequelize';

const createBook = async (bookData: IBook): Promise<IBook> => {
  const book = await Book.create(bookData);
  if (!book || !book.dataValues || !book.dataValues.id) {
    throw new Error('Error creating book');
  }
  return getBookById(book.dataValues.id);
};

const getBookById = async (id: number): Promise<IBook> => {
  const book = await Book.findByPk(id, {
    include: [
      { model: Author, as: 'autor', attributes: ['id', 'nombre'] },
      {
        model: Category,
        as: 'categorias',
        attributes: ['id', 'nombre', 'descripcion'],
        through: { attributes: [] },
      },
    ],
  });
  if (!book) {
    console.error(`Book with ID ${id} not found`);
    throw new Error(`Book with ID ${id} not found`);
  }
  return book.dataValues;
};

const updateBook = async (
  id: number,
  bookData: Partial<IBook>,
): Promise<IBook> => {
  const book = await Book.findByPk(id);
  if (!book) {
    console.error(`Book with ID ${id} not found`);
    throw new Error(`Book with ID ${id} not found`);
  }
  await book.update(bookData);
  return book.dataValues;
};

const getBooks = async (
  pagination: {
    page: number;
    pageSize: number;
    sortBy: keyof IBook;
    sortOrder: 'ASC' | 'DESC';
  },
  search?: string,
  precio_desde?: number,
  precio_hasta?: number,
  autor_id?: number[],
  categorias?: number[],
): Promise<{
  rows: IBook[];
  count: number;
}> => {
  const {
    page = 1,
    pageSize = 10000,
    sortBy = 'id',
    sortOrder = 'ASC',
  } = pagination;

  let where: WhereOptions<IBook> = [];

  if (search) {
    where.push({
      [Op.or]: [
        { titulo: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } },
      ],
    });
  }
  if (precio_desde !== undefined) {
    where.push({ precio: { [Op.gte]: precio_desde } });
  }
  if (precio_hasta !== undefined) {
    where.push({ precio: { [Op.lte]: precio_hasta } });
  }
  if (autor_id && autor_id.length > 0) {
    where.push({ autor_id: { [Op.in]: autor_id } });
  }

  let booksIds: number[] = [];

  const attributes: FindOptions<IBook>['attributes'] =
    sortBy !== 'id' ? ['id', sortBy] : ['id'];
  const booksWithCategories = await Book.findAndCountAll({
    attributes,
    include:
      categorias && categorias.length > 0
        ? [
            {
              model: Category,
              as: 'categorias',
              attributes: [],
              where: {
                categoria_id: { [Op.in]: categorias },
              },
            },
          ]
        : undefined,
    raw: true,
    order: [[sortBy, sortOrder]],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  booksIds = booksWithCategories.rows.map(
    (book) => book.dataValues.id as number,
  );

  if (booksIds.length > 0) {
    where = [{ id: { [Op.in]: booksIds } }];
  }

  const books = await Book.findAndCountAll({
    where: { id: { [Op.in]: booksIds } },
    order: booksIds.length > 0 ? [[sortBy, sortOrder]] : undefined,
    offset: booksIds.length > 0 ? (page - 1) * pageSize : undefined,
    limit: booksIds.length > 0 ? pageSize : undefined,
    include: [
      { model: Author, as: 'autor', attributes: ['id', 'nombre'] },
      {
        model: Category,
        as: 'categorias',
        attributes: ['id', 'nombre', 'descripcion'],
        through: { attributes: [] },
      },
    ],
  });

  if (!books || !books.rows || !books.count) {
    throw new Error('Error fetching books');
  }
  return {
    rows: books.rows.map((book) => book.dataValues),
    count: booksWithCategories.count,
  };
};

const deleteBook = async (id: number): Promise<boolean> => {
  const book = await Book.findByPk(id);
  if (!book) {
    console.error(`Book with ID ${id} not found`);
    return false;
  }
  await book.destroy();
  return true;
};

export { createBook, getBookById, updateBook, getBooks, deleteBook };
