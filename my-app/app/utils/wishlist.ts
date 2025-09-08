// app/utils/wishlist.ts
import type { IWishlistRow } from '@/app/components/cautrucdata';

/**
 * Rút mảng product_id an toàn từ API /api/wishlist
 * - Hỗ trợ cả 2 dạng: { product_id } hoặc { product: { id } }
 * - Dùng type guard để TS hiểu kết quả là number[]
 * - Loại bỏ trùng ID
 */
export function extractWishlistIds(data: unknown): number[] {
  const rows: IWishlistRow[] = Array.isArray(data) ? (data as IWishlistRow[]) : [];

  const ids = rows
    .map((row) => {
      const a = row?.product_id;
      const b = row?.product?.id;
      return typeof a === 'number'
        ? a
        : typeof b === 'number'
        ? b
        : undefined;
    })
    .filter((v: number | undefined): v is number => typeof v === 'number');

  return Array.from(new Set(ids));
}
