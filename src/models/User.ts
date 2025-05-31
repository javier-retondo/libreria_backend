import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

enum UserRole {
  ADMIN = 'administrador',
  USER = 'usuario',
}

interface IUser {
  id?: number;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  provisional: boolean;
}

type UserCreationAttributes = Optional<IUser, 'id'>;

class User extends Model<IUser, UserCreationAttributes> {}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM(UserRole.ADMIN, UserRole.USER),
      defaultValue: UserRole.USER,
    },
    provisional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    name: {
      singular: 'usuario',
      plural: 'usuarios',
    },
    timestamps: true,
  },
);

export { User, IUser, UserRole };
