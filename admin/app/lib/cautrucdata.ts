// Brand
export interface IBrand {
  id: number;
  name: string;
  slug: string;
  status: number;
  sort_order: number;
  logo_url?: string; // Thêm trường logo nếu cần
}

// Product
export interface IProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price: number;
  description: string;
  gender: string;
  movement_type: string;
  strap_material: string;
  crystal: string;
  water_resistance: string;
  stock_quantity: number;
  created_at?: string;
  view: number;
  status: number;
  sort_order: number;
  hot: number;
  brand?: { id: number; name: string };
  images?: { id?: number; image_url: string; is_main?: 0 | 1 }[];
}

// User
export interface IUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  phone: string;
  address: string;
  created_at?: string;
  role: string;
  email_verified_at?: string;
  avatar: string;
  status: number;
  remember_token?: string;
}

// Order
export interface IOrder {
  id: number;
  user_id: number;
  receiver_name: string;
  order_date?: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  note: string;
}

// Order Item
export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

// Post
export interface IPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  is_published: number;
  image_url: string;
  user_id: number;
  user?: { id: number; full_name: string; email: string }; // Thông tin người dùng
}

// Product Image
export interface IProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_main: number;
}

// Wishlist
export interface IWishlist {
  id: number;
  user_id: number;
  product_id: number;
  added_at?: string;
}

// Banner
export interface IBanner {
  id: number;
  image_url: string;
  valid_from?: string;
  valid_to?: string;
  status: number;
}

// Comment
export interface IComment {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  created_at?: string;
}

// Coupon
export interface ICoupon {
  id: number;
  code: string;
  discount_percent: number;
  valid_from?: string;
  valid_to?: string;
  usage_limit: number;
}