import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface ICategory {
  id?: number;
  nombre: string;
  descripcion?: string;
}

type CategoryCreationAttributes = Optional<ICategory, 'id'>;

class Category extends Model<ICategory, CategoryCreationAttributes> {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'categorias',
    name: {
      singular: 'categoria',
      plural: 'categorias',
    },
    timestamps: true,
  },
);

export { Category, ICategory };
