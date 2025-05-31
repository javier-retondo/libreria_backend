import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import { User } from './User';
import { OrderItem } from './OrderDetail';

enum OrderStatus {
  PENDING = 'pendiente',
  COMPLETED = 'completado',
  CANCELED = 'cancelado',
}

interface IOrder {
  id?: number;
  fecha: Date;
  usuario_id: number;
  estado: OrderStatus;
}

type OrderCreationAttributes = Optional<IOrder, 'id'>;

class Order extends Model<IOrder, OrderCreationAttributes> {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        OrderStatus.PENDING,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELED,
      ),
      defaultValue: OrderStatus.PENDING,
    },
  },
  {
    sequelize,
    tableName: 'ordenes',
    name: {
      singular: 'orden',
      plural: 'ordenes',
    },
    timestamps: false,
  },
);

const initOrderAssociations = () => {
  console.log(`   🔄 Iniciando asociaciones de 'Ordenes'`);
  Order.belongsTo(User, {
    foreignKey: 'usuario_id',
    targetKey: 'id',
    as: 'usuario',
  });

  Order.hasMany(OrderItem, {
    foreignKey: 'orden_id',
    sourceKey: 'id',
    as: 'detalles',
  });
};

export { Order, IOrder, OrderStatus, initOrderAssociations };
