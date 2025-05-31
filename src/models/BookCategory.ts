import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface IBookCategory {
  id?: number;
  libro_id: number;
  categoria_id: number;
}

type BookCategoryCreationAttributes = Optional<IBookCategory, 'id'>;

class BookCategory extends Model<
  IBookCategory,
  BookCategoryCreationAttributes
> {}

BookCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    libro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'libros',
    name: {
      singular: 'libro',
      plural: 'libros',
    },
    timestamps: true,
  },
);

export { BookCategory, IBookCategory };
