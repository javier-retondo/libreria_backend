import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface IAuthor {
  id?: number;
  nombre: string;
  biografia: string;
  fecha_nacimiento: Date;
  nacionalidad: string;
}

type AuthorCreationAttributes = Optional<IAuthor, 'id'>;

class Author extends Model<IAuthor, AuthorCreationAttributes> {}

Author.init(
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
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nacionalidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'autores',
    name: {
      singular: 'autor',
      plural: 'autores',
    },
    timestamps: true,
  },
);

export { Author, IAuthor };
