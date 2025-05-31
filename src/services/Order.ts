import { Op } from 'sequelize';
import sequelize from '../database';
import { IOrder, IOrderItem, Order, OrderItem } from '../models';

const createOrder = async (
  orderData: IOrder,
  items: IOrderItem[],
): Promise<IOrder> => {
  const transaction = await sequelize.transaction();
  const order = await Order.create(orderData, { transaction });
  if (!order || !order.dataValues || !order.dataValues.id) {
    await transaction.rollback();
    throw new Error('Error creating order');
  }
  const orderItems = await OrderItem.bulkCreate(
    items.map((item) => ({
      ...item,
      orden_id: order.dataValues.id as number,
    })),
    { transaction },
  );

  if (!orderItems || orderItems.length === 0) {
    await transaction.rollback();
    throw new Error('Error creating order items');
  }
  await transaction.commit();

  return await getOrderById(order.dataValues.id as number);
};

const getOrderById = async (id: number): Promise<IOrder> => {
  const order = await Order.findByPk(id, {
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) {
    console.error(`Order with ID ${id} not found`);
    throw new Error(`Order with ID ${id} not found`);
  }
  return order.dataValues;
};

const getOrders = async (
  pagination: {
    page: number;
    pageSize: number;
    sortBy: keyof IOrder;
    sortOrder: 'ASC' | 'DESC';
  },
  search?: string,
): Promise<{
  rows: IOrder[];
  count: number;
}> => {
  const {
    page = 1,
    pageSize = 10000,
    sortBy = 'id',
    sortOrder = 'ASC',
  } = pagination;

  const where: any = {};
  if (search) {
    where['$usuario.nombre$'] = { [Op.iLike]: `%${search}%` };
  }

  const orders = await Order.findAndCountAll({
    where,
    order: [[sortBy, sortOrder]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [{ model: OrderItem, as: 'items' }],
  });

  return {
    rows: orders.rows.map((order) => order.dataValues),
    count: orders.count,
  };
};
