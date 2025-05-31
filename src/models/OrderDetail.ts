import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import { Order } from './Order';
import { Book } from './Book';

interface IOrderItem {
  id?: number;
  libro_id: number;
  cantidad: number;
  precio: number;
  orden_id: number;
}

type OrderItemCreationAttributes = Optional<IOrderItem, 'id'>;

class OrderItem extends Model<IOrderItem, OrderItemCreationAttributes> {}

OrderItem.init(
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
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    orden_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'orden_items',
    name: {
      singular: 'ordenItem',
      plural: 'ordenItems',
    },
    timestamps: false,
  },
);

const initOrderItemAssociations = () => {
  console.log(`   🔄 Iniciando asociaciones de 'Items de Ordenes'`);
  OrderItem.belongsTo(Order, {
    foreignKey: 'orden_id',
    targetKey: 'id',
    as: 'orden',
  });

  OrderItem.belongsTo(Book, {
    foreignKey: 'libro_id',
    targetKey: 'id',
    as: 'libro',
  });
};

export { OrderItem, IOrderItem, initOrderItemAssociations };
