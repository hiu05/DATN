'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import type { ISanPham, IBrand } from '../components/cautrucdata';
import { extractWishlistIds } from '../utils/wishlist';
import { useDispatch } from 'react-redux';
import { themSP } from '@/lib/cartSlice'; // ✅ dùng Redux

type CurrentUser = { id: number; token?: string } | null;

const NOIMG = '/images/no-image.png';

const pickMainImage = (sp: ISanPham): string => (
  // Ưu tiên cột image_url nếu API đã join sẵn
  (sp as any).image_url ||
  sp.images?.find((i: any) => i?.is_main === 1)?.image_url ||
  sp.images?.[0]?.image_url ||
  NOIMG
);

export default function TrangSanPham() {
  const [dsSP, setDsSP] = useState<ISanPham[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [user, setUser] = useState<CurrentUser>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const brandFilter = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'new';

  const dispatch = useDispatch();

  // ===== USER =====
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
    } catch {}
  }, []);

  // ===== FAVORITES =====
  useEffect(() => {
    const loadLocal = () => {
      try {
        const fav = localStorage.getItem('favorites');
        setFavorites(fav ? JSON.parse(fav) : []);
      } catch {
        setFavorites([]);
      }
    };
    const loadFromAPI = async (u: CurrentUser) => {
      if (!u?.id) return loadLocal();
      try {
        const res = await fetch('http://localhost:3000/api/wishlist', {
          headers: { 'x-user-id': String(u.id) },
          cache: 'no-store',
        });
        const data = await res.json();
        setFavorites(extractWishlistIds(data));
      } catch {
        loadLocal();
      }
    };
    loadFromAPI(user);
  }, [user]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'favorites' && !user) {
        try {
          setFavorites(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setFavorites([]);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const announceWishlist = (n: number) => {
    try { window.dispatchEvent(new CustomEvent('wishlist:update', { detail: n })); } catch {}
  };
const isFavorite = (id: number) => favorites.includes(id);

  const saveLocalFavorites = (updated: number[]) => {
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    announceWishlist(updated.length);
  };

  const toggleFavorite = async (productId: number) => {
    if (user?.id) {
      try {
        if (isFavorite(productId)) {
          await fetch(`http://localhost:3000/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': String(user.id) },
          });
          const updated = favorites.filter((id) => id !== productId);
          setFavorites(updated);
          announceWishlist(updated.length);
        } else {
          await fetch('http://localhost:3000/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
            body: JSON.stringify({ product_id: productId }),
          });
          const updated = Array.from(new Set([...favorites, productId]));
          setFavorites(updated);
          announceWishlist(updated.length);
        }
      } catch {
        const updated = isFavorite(productId)
          ? favorites.filter((id) => id !== productId)
          : Array.from(new Set([...favorites, productId]));
        saveLocalFavorites(updated);
      }
      return;
    }

    const updated = isFavorite(productId)
      ? favorites.filter((id) => id !== productId)
      : Array.from(new Set([...favorites, productId]));
    saveLocalFavorites(updated);
  };

  // ===== CART (Redux only) =====
  const addToCart = (sp: ISanPham) => {
    // Bơm image_url vào sp để chắc chắn giỏ có ảnh
    const spWithImg = { ...sp, image_url: pickMainImage(sp) };
    // Thống nhất format { sp, qty } (giống trang Home)
    dispatch(themSP({ sp: spWithImg, qty: 1 }));
    alert('✅ Đã thêm vào giỏ hàng');
  };

  // ===== FETCH FILTER DATA =====
  useEffect(() => {
    fetch('http://localhost:3000/api/brands')
      .then(res => res.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:3000/api/sanpham?`;
    if (brandFilter) url += `brand=${brandFilter}&`;
    if (sort) url += `sort=${sort}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDsSP(data);
        else setError('❌ Dữ liệu trả về không hợp lệ');
        setLoading(false);
      })
      .catch(() => {
        setError('❌ Không thể tải dữ liệu');
        setLoading(false);
      });
  }, [brandFilter, sort]);

  const handleBrandChange = (value: string) => {
    router.push(`/san-pham?brand=${value}&sort=${sort}`);
  };

  const handleSortChange = (value: string) => {
    router.push(`/san-pham?brand=${brandFilter}&sort=${value}`);
  };

  const renderButton = (label: string, value: string) => (
<button
      key={value}
      onClick={() => handleSortChange(value)}
      className={`px-4 py-1 rounded-full border text-sm font-medium transition shadow-sm ${
        sort === value
          ? 'bg-orange-600 text-white border-orange-600'
          : 'hover:bg-gray-100 text-gray-800 border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 uppercase tracking-wide">
        Danh sách sản phẩm
      </h2>

      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <select
          className="border p-2 rounded shadow-sm"
          value={brandFilter}
          onChange={(e) => handleBrandChange(e.target.value)}
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>

        {renderButton('Xu hướng', 'new')}
        {renderButton('Xem nhiều nhất', 'view')}
        {renderButton('% SALE LỚN', 'sale')}
        {renderButton('Giá giảm dần', 'price_desc')}
        {renderButton('Giá tăng dần', 'price_asc')}
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {dsSP.map(sp => {
            const giaGoc = Number(sp.price);
            const giaKM = Number(sp.discount_price);
            const coGiamGia = giaKM > 0 && giaKM < giaGoc;
            const phanTram = coGiamGia ? `-${Math.round(((giaGoc - giaKM) / giaGoc) * 100)}%` : '';
            const hinh = pickMainImage(sp);

            return (
              <div key={sp.id} className="border rounded-xl bg-white flex flex-col shadow-md hover:shadow-xl transition overflow-hidden relative group">
                <img
                  src={hinh}
                  alt={sp.name}
                  className="w-full h-52 object-contain  p-2"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = NOIMG; }}
                />
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
                    <button
                      onClick={() => toggleFavorite(sp.id)}
                      aria-pressed={isFavorite(sp.id)}
                      title={isFavorite(sp.id) ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                      className={[
                        'p-2 rounded-full border text-lg transition',
                        'focus:outline-none focus:ring-2 focus:ring-blue-300',
                        isFavorite(sp.id)
                          ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      ].join(' ')}
                    >
                      <FiHeart />
                    </button>

                    <button
                      onClick={() => addToCart(sp)}
                      className="p-2 rounded-full border bg-gray-100 hover:bg-gray-200 text-lg"
                      title="Thêm vào giỏ"
                    >
                      <FiShoppingCart />
                    </button>

                    <Link
                      href={`/san-pham/${sp.slug}`}
                      className="flex-1 text-white bg-orange-600 hover:bg-orange-700 text-center py-2 rounded font-medium text-sm"
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