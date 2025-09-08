// @/lib/cartSlice.ts
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { ISanPham } from '@/app/components/cautrucdata';

export const CART_KEY = 'tw_cart_v1';

export interface ICart {
  id: number;
  slug?: string | null;
  ten_sp: string;
  so_luong: number;
  gia_price: number;
  gia_km: number;
  image_url?: string;
  stock_quantity: number | null; // null = chưa biết/không giới hạn
}

type CartState = {
  listSP: ICart[];
  order: Record<string, unknown>;
};

// ---- Helpers ----
const parseStockAny = (v: any): number | null => {
  if (v === null || v === undefined || v === '' || Number.isNaN(v)) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const safe = Math.max(0, Math.floor(n));
  return safe; // 0 = hết hàng, >0 = còn
};

const normalizeStockFromSP = (sp: any): number | null => {
  const candidates = [sp?._stock, sp?.stock_quantity, sp?.stock, sp?.quantity, sp?.inventory];
  for (const c of candidates) {
    const parsed = parseStockAny(c);
    if (parsed !== null) return parsed;
  }
  return null;
};

// Lấy ảnh chính
const getMainImage = (sp: ISanPham): string | undefined => {
  const imgs = sp.images || [];
  const main = imgs.find((i: any) => i?.is_main === 1)?.image_url || imgs[0]?.image_url;
  return main || undefined;
};

// Migrate localStorage: CHUYỂN 0 cũ -> null để không chặn oan
const loadFromLocalStorage = (): ICart[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.map((it: any) => {
          let stock: number | null = null;
          const parsed = parseStockAny(it?.stock_quantity);
          stock = parsed === 0 ? null : parsed; // 0 cũ -> null
          return {
            ...it,
            stock_quantity: stock,
          } as ICart;
        })
      : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (cart: ICart[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
};

const initialState: CartState = {
  listSP: loadFromLocalStorage(),
  order: {},
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Thêm sản phẩm vào giỏ
    themSP: (state, action: PayloadAction<ISanPham | { sp: ISanPham; qty?: number }>) => {
      const payload = (action.payload as any).sp
        ? (action.payload as any)
        : { sp: action.payload, qty: 1 };

      const sp: ISanPham = payload.sp;
      const qty: number = Math.max(1, Number(payload.qty ?? 1));

      const id = Number(sp.id);
      const gia_price = Number(sp.price) || 0;
      const gia_km = Number(sp.discount_price) || 0;
      const stockFromSP = normalizeStockFromSP(sp); // có thể null/0/>0

      const index = state.listSP.findIndex((s: ICart) => s.id === id);

      if (index >= 0) {
        const item = state.listSP[index];

        // Cập nhật tồn kho nếu có thông tin mới
        if (stockFromSP !== null) {
          item.stock_quantity = stockFromSP;
        }

        const knownStock = item.stock_quantity;
        const currentQty = item.so_luong;

        if (knownStock !== null) {
          const proposed = currentQty + qty;
          if (proposed > knownStock) {
            const remaining = Math.max(0, knownStock - currentQty);
            if (remaining <= 0) {
              alert('⚠️ Sản phẩm đã đạt số lượng tối đa trong kho.');
            } else {
              item.so_luong = knownStock;
              alert(`⚠️ Chỉ còn ${remaining} sản phẩm trong kho. Đã cập nhật tối đa.`);
            }
          } else {
            item.so_luong = proposed;
          }
        } else {
          item.so_luong = currentQty + qty;
        }
      } else {
        // sản phẩm chưa có trong giỏ
        let addQty = qty;
        let stockForItem: number | null = stockFromSP;

        if (stockForItem !== null && addQty > stockForItem) {
          addQty = Math.max(0, stockForItem);
          if (addQty === 0) {
            alert('⚠️ Sản phẩm tạm hết hàng.');
            saveToLocalStorage(current(state).listSP);
            return;
          }
          alert(`⚠️ Chỉ còn ${stockForItem} sản phẩm trong kho. Đã thêm tối đa.`);
        }

        const item: ICart = {
          stock_quantity: stockForItem,
          id,
          slug: sp.slug ?? undefined,
          ten_sp: sp.name,
          so_luong: addQty,
          gia_price,
          gia_km,
          image_url: getMainImage(sp),
        };
        state.listSP.push(item);
      }

      saveToLocalStorage(current(state).listSP);
    },

    // Sửa số lượng sản phẩm
    suaSL: (state, action: PayloadAction<[number, number]>) => {
      const [id, newQtyRaw] = action.payload;
      const item = state.listSP.find((x) => x.id === id);
      if (!item) return;

      const next = Math.max(1, Number(newQtyRaw || 1));
      const stock = item.stock_quantity;
      const clamped = stock !== null ? Math.min(next, Math.max(1, stock)) : next;
      item.so_luong = clamped;

      saveToLocalStorage(current(state).listSP);
    },

    // Xóa 1 sản phẩm
    xoaSP: (state, action: PayloadAction<number | string>) => {
      const id = Number(action.payload);
      const index = state.listSP.findIndex((s) => s.id === id);
      if (index !== -1) {
        state.listSP.splice(index, 1);
      }
      saveToLocalStorage(current(state).listSP);
    },

    // Xóa toàn bộ giỏ
    xoaGH: (state) => {
      state.listSP = [];
      saveToLocalStorage([]);
    },

    // Đồng bộ lại giỏ từ localStorage
    syncFromStorage: (state) => {
      state.listSP = loadFromLocalStorage();
    },
  },
});

export const { themSP, suaSL, xoaSP, xoaGH, syncFromStorage } = cartSlice.actions;
export default cartSlice.reducer;

// ---- Selectors ----
export const selectCartItems = (state: any) => (state.cart?.listSP ?? []) as ICart[];

export const selectCartCount = (state: any) =>
  (state.cart?.listSP ?? []).reduce((sum: number, i: ICart) => sum + i.so_luong, 0);

export const selectCartSubtotal = (state: any) =>
  (state.cart?.listSP ?? []).reduce((sum: number, i: ICart) => {
    const price = i.gia_km > 0 && i.gia_km < i.gia_price ? i.gia_km : i.gia_price;
    return sum + price * i.so_luong;
  }, 0);
