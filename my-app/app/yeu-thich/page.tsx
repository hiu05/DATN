'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import type { ISanPham, IWishlistRow } from '../components/cautrucdata';
import { extractWishlistIds } from '../utils/wishlist';

type CurrentUser = { id: number; token?: string } | null;

export default function WishlistPage() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [items, setItems] = useState<ISanPham[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Đọc user từ localStorage (đổi key nếu bạn dùng key khác)
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem('user') ||
        localStorage.getItem('currentUser') ||
        localStorage.getItem('auth_user');
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj?.id) setUser({ id: Number(obj.id), token: obj.token });
      }
    } catch { /* ignore */ }
  }, []);

  // Emit event để header cập nhật badge ♥
  const emitCount = (n: number) => {
    try {
      window.dispatchEvent(new CustomEvent<number>('wishlist:update', { detail: n }));
    } catch {}
  };

  // Khách (localStorage)
  const loadGuest = async () => {
    setLoading(true);
    try {
      const favRaw = localStorage.getItem('favorites');
      const ids: number[] = favRaw ? JSON.parse(favRaw) : [];
      setFavorites(ids);
      emitCount(ids.length);

      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`http://localhost:3000/api/sanpham?ids=${ids.join(',')}`, { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data) ? (data as ISanPham[]) : []);
      setLoading(false);
    } catch {
      setError('❌ Không thể tải danh sách yêu thích');
      setLoading(false);
    }
  };

  // Đã đăng nhập (API /api/wishlist)
  const loadUser = async (u: CurrentUser) => {
    if (!u?.id) return loadGuest();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/wishlist', {
        headers: { 'x-user-id': String(u.id) },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('fetch wishlist failed');

      const data: unknown = await res.json();
      const rows: IWishlistRow[] = Array.isArray(data) ? (data as IWishlistRow[]) : [];

      // IDs tổng (unique) để setFavorites + badge
      const allIds = extractWishlistIds(rows);
      setFavorites(allIds);
      emitCount(allIds.length);

      if (allIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Lấy ngay các sản phẩm đã join trong response (nếu có)
      const joined: ISanPham[] = rows
        .map((r) => (r.product ? r.product : null))
        .filter((p: ISanPham | null): p is ISanPham => !!p);

      // Cần fetch thêm những ID chưa có trong joined
      const needIds = allIds.filter((id) => !joined.some((p) => p.id === id));

      if (needIds.length === 0) {
        setItems(joined);
        setLoading(false);
        return;
      }

      const res2 = await fetch(`http://localhost:3000/api/sanpham?ids=${needIds.join(',')}`, { cache: 'no-store' });
      const extra = await res2.json();
      const extraItems: ISanPham[] = Array.isArray(extra) ? (extra as ISanPham[]) : [];

      // Gộp + loại trùng theo id
      const mergedArray = [...joined, ...extraItems];
      const merged = Array.from(new Set(mergedArray.map((p) => p.id))).map(
        (id) => mergedArray.find((p) => p.id === id)!
      );

      setItems(merged);
      setLoading(false);
    } catch {
      // fallback sang khách nếu API lỗi
      await loadGuest();
    }
  };

  useEffect(() => {
    loadUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isFavorite = (id: number) => favorites.includes(id);

  const setLocalFavorites = (next: number[]) => {
    setFavorites(next);
    localStorage.setItem('favorites', JSON.stringify(next));
    emitCount(next.length);
  };

  const removeFromUI = (productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  // Toggle ♥ (ở trang này chủ yếu là bỏ khỏi yêu thích)
  const toggleFavorite = async (productId: number) => {
    if (user?.id) {
      try {
        if (isFavorite(productId)) {
          await fetch(`http://localhost:3000/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': String(user.id) },
          });
          const next = favorites.filter((id) => id !== productId);
          setFavorites(next);
          removeFromUI(productId);
          emitCount(next.length);
        } else {
          await fetch('http://localhost:3000/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
            body: JSON.stringify({ product_id: productId }),
          });
          const next = Array.from(new Set([...favorites, productId]));
          setFavorites(next);
          emitCount(next.length);
        }
      } catch {
        // fallback local nếu API lỗi
        const next = isFavorite(productId)
          ? favorites.filter((id) => id !== productId)
          : Array.from(new Set([...favorites, productId]));
        setLocalFavorites(next);
        if (!isFavorite(productId)) return; // vừa thêm → không cần remove UI
        removeFromUI(productId);
      }
      return;
    }

    // Khách
    const next = isFavorite(productId)
      ? favorites.filter((id) => id !== productId)
      : Array.from(new Set([...favorites, productId]));
    setLocalFavorites(next);
    if (isFavorite(productId)) removeFromUI(productId);
  };

  const addToCart = (sp: ISanPham) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ ...sp, so_luong: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('✅ Đã thêm vào giỏ hàng');
  };

  const title = useMemo(() => ' Sản phẩm yêu thích', []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10"><p>Đang tải...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold uppercase text-orange-500 mb-6">
        {title}
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {items.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Danh sách yêu thích trống.</p>
          <Link
            href="/san-pham"
            className="inline-block bg-orange-600 text-white px-4 py-2 rounded"
          >
            Đi xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {items.map((sp) => {
            const giaGoc = Number(sp.price);
            const giaKM = Number(sp.discount_price);
            const coGiamGia = giaKM > 0 && giaKM < giaGoc;
            const phanTram = coGiamGia ? `-${Math.round(((giaGoc - giaKM) / giaGoc) * 100)}%` : '';
            const hinh = sp.images?.[0]?.image_url || '/no-image.png';

            return (
              <div key={sp.id} className="group border rounded-xl bg-white flex flex-col shadow-sm hover:shadow-xl transition overflow-hidden relative">
                {/* Ảnh */}
                <div className="relative bg-white h-52 flex items-center justify-center">
                  <img
                    src={hinh}
                    alt={sp.name}
                    className="max-h-full object-contain p-2"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
                  />
                  {phanTram && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded shadow">
                      {phanTram}
                    </div>
                  )}
                </div>

                {/* Nội dung */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                    {sp.name}
                  </h3>

                  <div className="text-sm text-green-700 font-bold">
                    {giaKM.toLocaleString('vi-VN')} ₫
                  </div>

                  {coGiamGia && (
                    <div className="text-xs text-gray-500">
                      <span className="line-through mr-1">{giaGoc.toLocaleString('vi-VN')} ₫</span>
                      <span className="text-red-600 font-bold">{phanTram}</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-1">
                    👁 {sp.view?.toLocaleString('vi-VN') || '0'} lượt xem
                  </div>

                  <div className="mt-auto pt-4 flex items-center gap-2">
                    {/* ❤️ Toggle yêu thích: nền xám → đỏ khi đã thích */}
                    <button
                      onClick={() => toggleFavorite(sp.id)}
                      aria-pressed={isFavorite(sp.id)}
                      title={isFavorite(sp.id) ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                      className={[
                        'p-2 rounded-full border text-lg transition',
                        'focus:outline-none focus:ring-2 focus:ring-blue-300',
                        isFavorite(sp.id)
                          ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
                      ].join(' ')}
                    >
                      <FiHeart />
                    </button>

                    {/* 🛒 Giỏ hàng */}
                    <button
                      onClick={() => addToCart(sp)}
                      className="p-2 rounded-full border bg-gray-100 hover:bg-gray-200 text-lg"
                    >
                      <FiShoppingCart />
                    </button>

                    <Link
                      href={`/san-pham/${sp.slug}`}
                      className="flex-1 text-white bg-blue-600 hover:bg-blue-700 text-center py-2 rounded font-medium text-sm"
                    >
                      Xem Sản Phẩm
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
