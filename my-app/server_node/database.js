// server_node/database.js
const { Sequelize, DataTypes } = require('sequelize');

/* -------------------- KẾT NỐI MYSQL -------------------- */
const sequelize = new Sequelize('newtime_watch', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('✅ Kết nối MySQL thành công!'))
  .catch(err => console.error('❌ Không thể kết nối tới MySQL:', err));

/* -------------------- Model: brands -------------------- */
const BrandModel = sequelize.define('brands', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  logo_url: DataTypes.STRING,
  slug: DataTypes.STRING,
  sort_order: DataTypes.INTEGER,
  status: DataTypes.TINYINT,
}, { tableName: 'brands', timestamps: false });

/* -------------------- Model: products -------------------- */
const ProductModel = sequelize.define('products', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  price: DataTypes.INTEGER,
  discount_price: DataTypes.INTEGER,
  brand_id: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  description: DataTypes.TEXT,
  gender: DataTypes.STRING,
  movement_type: DataTypes.STRING,
  strap_material: DataTypes.STRING,
  crystal: DataTypes.STRING,
  water_resistance: DataTypes.STRING,
  stock_quantity: DataTypes.INTEGER,
  view: { type: DataTypes.INTEGER, defaultValue: 0 },
  hot: { type: DataTypes.TINYINT, defaultValue: 0 },
  status: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'products', timestamps: false });

/* -------------------- Model: product_images -------------------- */
const ProductImageModel = sequelize.define('product_images', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
  is_main: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'product_images', timestamps: false });

/* -------------------- Model: users -------------------- */
const UserModel = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // một số DB dùng full_name, một số dùng name → để cả 2 cho linh hoạt
  name: DataTypes.STRING,
  full_name: DataTypes.STRING,
  email: DataTypes.STRING,
}, { tableName: 'users', timestamps: false });

/* -------------------- Model: wishlists -------------------- */
const WishlistModel = sequelize.define('wishlists', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  added_at: { type: DataTypes.DATE, allowNull: true, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
}, { tableName: 'wishlists', timestamps: false });

/* -------------------- Model: posts (tin tức) -------------------- */
const PostModel = sequelize.define('posts', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  excerpt: DataTypes.TEXT,
  content: DataTypes.TEXT('long'),
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: true },
  is_published: { type: DataTypes.TINYINT, defaultValue: 0 },
  image_url: DataTypes.STRING,
  user_id: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'posts', timestamps: false });

/* -------------------- Model: comments (★ mới thêm) -------------------- */
const CommentModel = sequelize.define('comments', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
}, { tableName: 'comments', timestamps: false });

/* -------------------- Associations -------------------- */
// product ↔ images
ProductModel.hasMany(ProductImageModel, { foreignKey: 'product_id', as: 'images' });
ProductImageModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

// product ↔ brand
ProductModel.belongsTo(BrandModel, { foreignKey: 'brand_id', as: 'brand' });
BrandModel.hasMany(ProductModel, { foreignKey: 'brand_id' });

// wishlist ↔ product & user
WishlistModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });
ProductModel.hasMany(WishlistModel, { foreignKey: 'product_id', as: 'wishlisted_by' });
WishlistModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
UserModel.hasMany(WishlistModel, { foreignKey: 'user_id', as: 'wishlist' });

// posts ↔ author
PostModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'author' });
UserModel.hasMany(PostModel, { foreignKey: 'user_id', as: 'posts' });

// ★ comments ↔ user & product
CommentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
CommentModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

/* -------------------- Export -------------------- */
module.exports = {
  sequelize,
  BrandModel,
  ProductModel,
  ProductImageModel,
  WishlistModel,
  UserModel,
  PostModel,
  CommentModel,            // ★ Nhớ export
};
