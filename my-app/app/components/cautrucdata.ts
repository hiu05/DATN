export interface IBrand {
  id: number;
  name: string;
  logo?: string;
  logo_url?: string;
  slug?: string;
  status?: number;
  sort_order?: number;
}

export interface ISanPham {
    name:string;
    id:number;
    price: string;
    discount_price: string;
    images?: { image_url: string }[];
    view: number;
    slug: string;
    description: string;
    content: string;
    created_at: string;
    updated_at: string;
    category_id: number;
    category_name: string;
    brand_id: number;
    brand_name: string;
    date: string;
    gender: string;
    movement_type: string;
    strap_material: string;
    crystal: string;
    water_resistance: string;
    stock_quantity: number;
    images_url?: string[];
    image_url?: string; 
}
export interface IProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_main: number; // 1|0
}
export interface ICart {
    id : number 
    ten_sp: string;
    so_luong:number;
    gia_mua : number;
    hinh: string;
    stock_quantity: number; // số lượng tồn kho
    slug?: string; // slug sản phẩm (nếu có)
    gia_price: number; // giá gốc
    gia_km: number; // giá khuyến mãi (0 nếu không KM)
    image_url?: string; // ảnh chính (nếu có)
}
export interface IWishlistRow {
  id?: number;
  user_id?: number;
  product_id?: number;
  added_at?: string;
  product?: ISanPham;
}

// Alias nếu code cũ còn dùng ILoai
export type ILoai = IBrand;