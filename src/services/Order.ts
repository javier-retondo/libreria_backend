import { FindOptions, Op, WhereOptions } from 'sequelize';
import sequelize from '../database';
import {
  IOrder,
  IOrderItem,
  Order,
  OrderItem,
  OrderStatus,
  User,
} from '../models';

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
    include: [
      { model: OrderItem, as: 'items' },
      { model: User, as: 'usuario' },
    ],
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
  estado: OrderStatus,
  usuario_id?: number[],
  libro_id?: number[],
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

  const where: WhereOptions<IOrder> = {};

  if (usuario_id && usuario_id.length > 0) {
    where['id'] = usuario_id;
  }

  if (OrderStatus) {
    where['estado'] = estado;
  }

  let ordersIds: number[] = [];

  const attributes: FindOptions<IOrder>['attributes'] =
    sortBy !== 'id' ? ['id', sortBy] : ['id'];

  const ordersCount = await Order.findAndCountAll({
    where,
    attributes,
    include: [
      {
        model: OrderItem,
        as: 'items',
        attributes: [],
        where: [
          {
            producto_id:
              libro_id && libro_id.length > 0
                ? { [Op.in]: libro_id }
                : undefined,
          },
        ],
      },
    ],
    raw: true,
    order: [[sortBy, sortOrder]],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  ordersIds = ordersCount.rows.map((order) => order.dataValues.id as number);

  const orders = await Order.findAndCountAll({
    where: { id: { [Op.in]: ordersIds } },
    order: [[sortBy, sortOrder]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [
      { model: OrderItem, as: 'items' },
      {
        model: User,
        as: 'usuario',
      },
    ],
  });

  return {
    rows: orders.rows.map((order) => order.dataValues),
    count: orders.count,
  };
};

const updateStatus = async (
  id: number,
  estado: OrderStatus.COMPLETED | OrderStatus.CANCELED,
): Promise<IOrder> => {
  const order = await Order.findByPk(id);
  if (order?.dataValues.estado !== OrderStatus.PENDING) {
    throw new Error("El estado de la orden tiene que ser 'pendiente'");
  }
  await order.update({ estado });
  return order.dataValues;
};

export { createOrder, getOrderById, getOrders, updateStatus };
