// lib/models.ts 
import { DataTypes } from "sequelize";
import { db } from "./database";

export const BrandModel = db.define("brands", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, },
  slug: { type: DataTypes.STRING, defaultValue: "", },
  status: { type: DataTypes.INTEGER, defaultValue: 0 },
  sort_order: { type: DataTypes.INTEGER, defaultValue: true, },
  logo_url: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: "brands",
  timestamps: false, // Không sử dụng createdAt, updatedAt
});

export const ProductModel = db.define("products", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: true },
  slug: { type: DataTypes.STRING(255), allowNull: true },
  brand_id: { type: DataTypes.INTEGER, allowNull: true },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  discount_price: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  gender: { type: DataTypes.STRING(20), allowNull: true },
  movement_type: { type: DataTypes.STRING(50), allowNull: true },
  strap_material: { type: DataTypes.STRING(50), allowNull: true },
  crystal: { type: DataTypes.STRING(50), allowNull: true },
  water_resistance: { type: DataTypes.STRING(50), allowNull: true },
  stock_quantity: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  view: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
  sort_order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  hot: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
}, {
  tableName: "products",
  timestamps: false, // Không sử dụng createdAt, updatedAt
});
ProductModel.belongsTo(BrandModel, { foreignKey: "brand_id", as: "brand" });

export const UserModel = db.define("users", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  full_name: { type: DataTypes.STRING(100), allowNull: true },
  email: { type: DataTypes.STRING(100), allowNull: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  address: { type: DataTypes.STRING(255), allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  role: { type: DataTypes.STRING(50), allowNull: true, defaultValue: "user" },
  email_verified_at: { type: DataTypes.DATE, allowNull: true },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
  remember_token: { type: DataTypes.STRING(100), allowNull: true },
}, {
  tableName: "users",
  timestamps: false,
});
// Model cho bảng orders
export const OrderModel = db.define("orders", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  receiver_name: { type: DataTypes.STRING(100), allowNull: true },
  order_date: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('Chờ xác nhận','Đang xử lý','Đang giao','Đã giao','Đã hủy'), allowNull: true, defaultValue: 'Chờ xác nhận' },
  total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  shipping_address: { type: DataTypes.STRING(255), allowNull: true },
  payment_method: { type: DataTypes.STRING(50), allowNull: true },
  note: { type: DataTypes.TEXT, allowNull: true },
  coupon_id: { type: DataTypes.INTEGER, allowNull: true },
  receiver_phone: { type: DataTypes.STRING(20), allowNull: true },
}, {
  tableName: "orders",
  timestamps: false,
});


// Model cho bảng order_items
export const OrderItemModel = db.define("order_items", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: true },
  unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: true },
}, {
  tableName: "order_items",
  timestamps: false,
});

// Model cho bảng posts
export const PostModel = db.define("posts", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false },
  excerpt: { type: DataTypes.TEXT, allowNull: true },
  content: { type: DataTypes.TEXT('long'), allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: true },
  is_published: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "posts",
  timestamps: false,
});

// Model cho bảng product_images
export const ProductImageModel = db.define("product_images", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  is_main: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0 },
}, {
  tableName: "product_images",
  timestamps: false,
});

// Model cho bảng wishlists
export const WishlistModel = db.define("wishlists", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  added_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
}, {
  tableName: "wishlists",
  timestamps: false,
});

// Model cho bảng banners
export const BannerModel = db.define("banners", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  valid_from: { type: DataTypes.DATE, allowNull: true },
  valid_to: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 1 },
}, {
  tableName: "banners",
  timestamps: false,
});


// Model cho bảng comments
export const CommentModel = db.define("comments", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: true },
  comment: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
}, {
  tableName: "comments",
  timestamps: false,
});

// Model cho bảng coupons
export const CouponModel = db.define("coupons", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: false },
  discount_percent: { type: DataTypes.DECIMAL(5,2), allowNull: true },
  valid_from: { type: DataTypes.DATE, allowNull: true },
  valid_to: { type: DataTypes.DATE, allowNull: true },
  usage_limit: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "coupons",
  timestamps: false,
});
ProductModel.hasMany(ProductImageModel, { foreignKey: "product_id", as: "images" });
export async function syncDatabase() {
  await db.sync();
}

// Associations
OrderModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
OrderModel.belongsTo(CouponModel, { foreignKey: "coupon_id", as: "coupon" });
OrderModel.hasMany(OrderItemModel, { foreignKey: "order_id", as: "items" });

OrderItemModel.belongsTo(OrderModel, { foreignKey: "order_id" });
OrderItemModel.belongsTo(ProductModel, { foreignKey: "product_id", as: "product" });

PostModel.belongsTo(UserModel, { foreignKey: "user_id" });