import bcrypt from 'bcrypt';
import ejs from 'ejs';
import { IUser, User, UserRole } from '../models';
import { join } from 'path';
import sendEmail from '../utils/mailer';
import { Op, WhereOptions } from 'sequelize';

const createUser = async (
  nombre: string,
  email: string,
  rol: UserRole,
): Promise<IUser> => {
  const password = Math.random().toString(36).slice(-8);
  const encryptedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    nombre,
    email,
    password: encryptedPassword,
    rol,
    pass_provisional: true,
  })
    .then((user) => {
      delete user.dataValues.password;
      return user.dataValues;
    })
    .catch((error) => {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    });
  console.log(
    `User created: ${user.nombre} (${user.email}) with role ${user.rol}`,
  );

  const html = await ejs.renderFile(join('templates', 'welcome.ejs'), {
    nombre: user.nombre,
    email: user.email,
    password: password,
  });

  await sendEmail(user.email, 'Bienvenido a la plataforma', html);
  return user;
};

const updateUser = async (
  id: number,
  data: Partial<IUser>,
): Promise<IUser | null> => {
  const user = await User.findByPk(id);
  if (!user) {
    console.error(`User with ID ${id} not found`);
    return null;
  }
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  await user.update(data);
  delete user.dataValues.password;
  return user.dataValues;
};

const resetUserPassword = async (id: number): Promise<IUser> => {
  const user = await User.findByPk(id).then((user) => {
    if (user) {
      delete user.dataValues.password;
      return user;
    }
    return null;
  });
  if (!user) {
    console.error(`User with ID ${id} not found`);
    throw new Error(`User with ID ${id} not found`);
  }
  const newPassword = Math.random().toString(36).slice(-8);
  const encryptedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({
    password: encryptedPassword,
    pass_provisional: true,
  });
  delete user.dataValues.password;

  const html = await ejs.renderFile(join('templates', 'welcome.ejs'), {
    nombre: user.dataValues.nombre,
    email: user.dataValues.email,
    password: newPassword,
  });

  await sendEmail(user.dataValues.email, 'Bienvenido a la plataforma', html);

  return user.dataValues;
};

const getUserByEmail = async (email: string): Promise<IUser | null> => {
  const user = await User.findOne({
    where: { email: { [Op.iLike]: `%${email}%` } },
  });
  if (user) {
    delete user.dataValues.password;
    return user.dataValues;
  }
  return null;
};

const getUserById = async (id: number): Promise<IUser | null> => {
  const user = await User.findByPk(id);
  if (user) {
    delete user.dataValues.password;
    return user.dataValues;
  }
  return null;
};

const getAllUsers = async (
  pagination: {
    page: number;
    pageSize: number;
    sortBy: keyof IUser;
    sortOrder: 'ASC' | 'DESC';
  },
  search?: string,
  rol?: UserRole,
): Promise<{
  rows: IUser[];
  count: number;
}> => {
  const {
    page = 1,
    pageSize = 10000,
    sortBy = 'id',
    sortOrder = 'ASC',
  } = pagination;
  let where: WhereOptions<IUser> = [];
  if (search) {
    where = [
      { nombre: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (rol) {
    where.push({ rol });
  }
  const users = await User.findAndCountAll({
    where: where.length > 0 ? { [Op.or]: where } : undefined,
    order: [[sortBy, sortOrder]],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  })
    .then((users) => {
      return {
        rows: users.rows.map((user) => {
          const userData = user.dataValues;
          delete userData.password;
          return userData;
        }),
        count: users.count,
      };
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      throw new Error('Error fetching users');
    });

  return users;
};

const deleteUser = async (id: number): Promise<void> => {
  const user = await User.findByPk(id);
  if (!user) {
    console.error(`User with ID ${id} not found`);
    throw new Error(`User with ID ${id} not found`);
  }
  await user.destroy();
  console.log(`User with ID ${id} deleted successfully`);
};

export {
  createUser,
  updateUser,
  resetUserPassword,
  getUserByEmail,
  getUserById,
  getAllUsers,
  deleteUser,
};
