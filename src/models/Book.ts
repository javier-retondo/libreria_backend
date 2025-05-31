import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import { Author } from './Author';
import { Category } from './Category';
import { BookCategory } from './BookCategory';

interface IBook {
  id?: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  autor_id: number;
}

type BookCreationAttributes = Optional<IBook, 'id'>;

class Book extends Model<IBook, BookCreationAttributes> {}

Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    imagen_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    autor_id: {
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

const initBookAssociations = () => {
  console.log(`   🔄 Iniciando asociaciones de 'Libro'`);
  Book.belongsTo(Author, {
    foreignKey: 'autor_id',
    targetKey: 'author_id',
    as: 'autor',
  });

  Book.belongsToMany(Category, {
    sourceKey: 'libro_id',
    foreignKey: 'libro_id',
    otherKey: 'categoria_id',
    as: 'categorias',
    through: BookCategory,
  });
};

export { Book, IBook, initBookAssociations };
