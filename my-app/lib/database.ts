import { Sequelize, DataTypes } from "sequelize";

export const sequelize = new Sequelize("newtime_watch", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export const UserModel = sequelize.define("users", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
}, { tableName: "users", timestamps: false });

export const ProductModel = sequelize.define("products", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  price: DataTypes.FLOAT,
  discount_price: DataTypes.FLOAT,
  description: DataTypes.TEXT,
  gender: DataTypes.STRING,
  movement_type: DataTypes.STRING,
  strap_material: DataTypes.STRING,
  crystal: DataTypes.STRING,
  water_resistance: DataTypes.STRING,
  stock_quantity: DataTypes.INTEGER,
  view: DataTypes.INTEGER,
}, { tableName: "products", timestamps: false });

export const CommentModel = sequelize.define("comments", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: "comments", timestamps: false });

CommentModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
CommentModel.belongsTo(ProductModel, { foreignKey: "product_id", as: "product" });
