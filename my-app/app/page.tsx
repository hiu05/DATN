'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import type { ISanPham } from './components/cautrucdata';
import BrandSlider from './components/BrandSlider';
import { extractWishlistIds } from './utils/wishlist';
import { themSP } from '@/lib/cartSlice';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaRocket, FaExchangeAlt, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { MdWatch } from 'react-icons/md';

type CurrentUser = { id: number; token?: string } | null;

const NOIMG = '/images/no-image.png';

const pickMainImage = (sp: ISanPham): string => (
  // Ưu tiên cột image_url nếu API đã join sẵn
  (sp as any).image_url ||
  sp.images?.find((i: any) => i?.is_main === 1)?.image_url ||
  sp.images?.[0]?.image_url ||
  NOIMG
);
function Arrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer
        opacity-0 group-hover:opacity-100 transition-all duration-300
        p-2 rounded-full shadow-md border
        ${direction === 'right' ? 'right-0' : 'left-0'}
        bg-white text-gray-600 hover:bg-orange-500 hover:text-white
      `}
    >
      {direction === 'right' ? '❯' : '❮'}
    </div>
  );
}
const NextArrow = (props: any) => <Arrow direction="right" {...props} />;
const PrevArrow = (props: any) => <Arrow direction="left" {...props} />;

// Lợi ích (benefits)
const BENEFITS = [
  { icon: <MdWatch className="text-white text-2xl" />, title: 'Mẫu mã đa dạng nhất', desc: 'Hoàn tiền nếu phát hiện bán hàng giả' },
  { icon: <FaRocket className="text-white text-2xl" />, title: 'Miễn phí vận chuyển', desc: 'Giao hàng nhanh, đóng gói cẩn thận' },
  { icon: <FaExchangeAlt className="text-white text-2xl" />, title: 'Đổi hàng 7 ngày', desc: '1 đổi 1 trong 7 ngày với sản phẩm lỗi' },
  { icon: <FaShieldAlt className="text-white text-2xl" />, title: 'Bảo hành 5 năm', desc: 'Thủ tục nhanh gọn, thay pin miễn phí' },
  { icon: <FaCheckCircle className="text-white text-2xl" />, title: 'Đeo trước trả sau', desc: 'Trả trước 1 phần, 2 phần còn lại trả sau' },
];

/* ===== Helpers cho tồn kho: đồng bộ với cartSlice ===== */
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
  return null; // null = chưa biết/không giới hạn
};

export default function Home() {
  const dispatch = useDispatch();
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000', []);
  const [user, setUser] = useState<CurrentUser>(null);

  // Data
  const [spHot, setSpHot] = useState<ISanPham[]>([]);
  const [spMoi, setSpMoi] = useState<ISanPham[]>([]);
  const [spView, setSpView] = useState<ISanPham[]>([]);

  // Errors
  const [errorHot, setErrorHot] = useState<string | null>(null);
  const [errorMoi, setErrorMoi] = useState<string | null>(null);
  const [errorView, setErrorView] = useState<string | null>(null);

  // ❤️ Favorites (mảng id)
  const [favorites, setFavorites] = useState<number[]>([]);

  // đọc user từ localStorage
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
    } catch { }
  }, []);

  // load favorites theo login/guest
  useEffect(() => {
    const loadLocal = () => {
      try {
        const fav = localStorage.getItem('favorites') || localStorage.getItem('wishlist');
        setFavorites(fav ? JSON.parse(fav) : []);
      } catch {
        setFavorites([]);
      }
    };

    const loadFromAPI = async (u: CurrentUser) => {
      if (!u?.id) return loadLocal();
      try {
        const res = await fetch(`${apiBase}/api/wishlist`, {
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
  }, [user, apiBase]);

  // đồng bộ giữa tab khi guest đổi favorites
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if ((e.key === 'favorites' || e.key === 'wishlist') && !user) {
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

  // 👉 Phát sự kiện cho Header MỖI KHI favorites thay đổi (kể cả lần đầu)
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('wishlist:update', { detail: favorites.length }));
    } catch { }
  }, [favorites]);

  const isFavorite = (id: number) => favorites.includes(id);

  // Lưu local và để useEffect ở trên tự announce
  const saveLocal = (updated: number[]) => {
    setFavorites(updated);
    try {
      localStorage.setItem('favorites', JSON.stringify(updated));
    } catch { }
  };

  const toggleFavorite = async (productId: number) => {
    if (user?.id) {
      try {
        if (isFavorite(productId)) {
          await fetch(`${apiBase}/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'x-user-id': String(user.id) },
          });
          const updated = favorites.filter((id) => id !== productId);
          setFavorites(updated);
        } else {
          await fetch(`${apiBase}/api/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(user.id) },
            body: JSON.stringify({ product_id: productId }),
          });
          const updated = Array.from(new Set([...favorites, productId]));
          setFavorites(updated);
        }
      } catch {
        const updated = isFavorite(productId)
          ? favorites.filter((id) => id !== productId)
          : Array.from(new Set([...favorites, productId]));
        saveLocal(updated);
      }
      return;
    }

    const updated = isFavorite(productId)
      ? favorites.filter((id) => id !== productId)
      : Array.from(new Set([...favorites, productId]));
    saveLocal(updated);
  };


  // ===== CART (Redux only) =====
  const addToCart = (sp: ISanPham) => {
    // Bơm image_url vào sp để chắc chắn giỏ có ảnh
    const spWithImg = { ...sp, image_url: pickMainImage(sp) };
    // Thống nhất format { sp, qty } (giống trang Home)
    dispatch(themSP({ sp: spWithImg, qty: 1 }));
    alert('✅ Đã thêm vào giỏ hàng');
  };

  // fetch data
  useEffect(() => {
    fetch(`${apiBase}/api/sphot/12`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSpHot(data);
        else setErrorHot('❌ Dữ liệu sản phẩm hot không hợp lệ');
      })
      .catch(() => setErrorHot('❌ Không thể tải sản phẩm hot'));

    fetch(`${apiBase}/api/spmoi/12`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSpMoi(data);
        else setErrorMoi('❌ Dữ liệu sản phẩm mới không hợp lệ');
      })
      .catch(() => setErrorMoi('❌ Không thể tải sản phẩm mới'));
  }, [apiBase]);

  // Card hiển thị sản phẩm
  const renderSP = (sp: ISanPham) => {
    const giaKM = Number(sp.discount_price);
    const giaGoc = Number(sp.price);
    const coGiamGia = giaKM > 0 && giaKM < giaGoc;
    const phanTram = coGiamGia ? `-${Math.round(((giaGoc - giaKM) / giaGoc) * 100)}%` : '';
    const hinh =
      sp.images?.find((i: any) => i.is_main === 1)?.image_url ||
      sp.images?.[0]?.image_url ||
      '/no-image.png';

    const liked = isFavorite(sp.id);

    return (
      <div key={sp.id} className="group border rounded-xl bg-white flex flex-col shadow-sm hover:shadow-xl transition overflow-hidden relative">
        {/* Ảnh sản phẩm */}
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
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">{sp.name}</h3>

          <div className="text-sm text-green-700 font-bold">{giaKM.toLocaleString('vi-VN')} ₫</div>

          {coGiamGia && (
            <div className="text-xs text-gray-500">
              <span className="line-through mr-1">{giaGoc.toLocaleString('vi-VN')} ₫</span>
              <span className="text-red-600 font-bold">{phanTram}</span>
            </div>
          )}

          <div className="text-xs text-gray-400 mt-1">👁 {sp.view?.toLocaleString('vi-VN') || '0'} lượt xem</div>

          <div className="mt-auto pt-4 flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(sp.id)}
              aria-pressed={liked}
              title={liked ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
              className={[
                'p-2 rounded-full border text-lg transition',
                'focus:outline-none focus:ring-2 focus:ring-blue-300',
                liked ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
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
  };

  // Slider (section Xu hướng)
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">
      {/* Banner + slider sản phẩm nổi bật */}
      <div className="space-y-0">
        <div className="w-full">
          <img src="/images/banner-xu-huong.jpg" alt="Banner xu hướng" className="w-full object-cover" />
        </div>

        <div className="bg-orange-400 py-6 px-2 ">
          <div className="max-w-[1320px] mx-auto relative">
            <div className="relative group">
              <Slider {...sliderSettings}>
                {spHot.slice(0, 12).map((sp) => (
                  <div key={sp.id} className="px-3">
                    {renderSP(sp)}
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <div className="text-center mt-6">
            <a
              href="/san-pham?sort=hot"
              className="border border-black bg-white text-black px-6 py-2 rounded-full font-semibold shadow-sm hover:text-orange-500 transition"
            >
              KHÁM PHÁ XU HƯỚNG 2025
            </a>
          </div>
        </div>
      </div>

      {/* Lợi ích (benefits) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-2">
        {BENEFITS.map((item, index) => (
          <div key={index} className="flex items-start bg-green-50 rounded-lg p-3 gap-3">
            <div className="bg-orange-400 p-2 rounded-md">{item.icon}</div>
            <div>
              <h4 className="font-bold text-sm">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/*  SẢN PHẨM NỔI BẬT */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4xl font-bold uppercase text-orange-500">Sản phẩm nổi bật</h2>
          <Link href="/san-pham?sort=hot" className="text-blue-600 text-sm hover:underline">
            Xem tất cả
          </Link>
        </div>
        {errorHot && <p className="text-red-600">{errorHot}</p>}
        {!errorHot && spHot.length === 0 && <p>Không có sản phẩm hot nào.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {spHot.map(renderSP)}
        </div>
      </section>

      {/*  SẢN PHẨM MỚI */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4xl font-bold uppercase text-orange-500">Sản phẩm mới</h2>
          <Link href="/san-pham?sort=new" className="text-blue-600 text-sm hover:underline">
            Xem tất cả
          </Link>
        </div>
        {errorMoi && <p className="text-red-600">{errorMoi}</p>}
        {!errorMoi && spMoi.length === 0 && <p>Không có sản phẩm mới nào.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {spMoi.map(renderSP)}
        </div>
      </section>

      {/*  THƯƠNG HIỆU */}
      <BrandSlider />

      {/* Giới thiệu cửa hàng */}
      <section className="flex flex-col lg:flex-row items-center gap-6 bg-gray-100 rounded-lg p-6 shadow">
        <div className="flex-1">
          <img
            src="/images/banner-watch.webp"
            alt="Banner Watch"
            className="rounded-lg w-full object-cover"
          />
        </div>

        <div className="flex-1 text-center lg:text-left space-y-4">
          <img src="/images/logo2.png" alt="Logo" className="h-50 mx-auto" />
          <h2 className="text-2xl font-bold text-orange-500">Cửa hàng đồng hồ đeo tay chính hãng</h2>
          <p className="text-gray-700">
            Được thành lập vào năm 2024, trải qua 1 năm hoạt động và phát triển, chuỗi cửa hàng đồng hồ WatchStore trở thành đại lý ủy quyền cho rất nhiều thương hiệu đến từ Nhật Bản và Thụy Sỹ chuyên bán đồng hồ đeo tay chính hãng.
          </p>
          <p className="text-gray-700">
            Chính sách bảo hành 5 năm cùng với các chương trình giảm giá tốt sẽ giúp bạn mua sắm dễ dàng. Với đội ngũ nhân viên tận tình, am hiểu kiến thức, các tiệm đồng hồ WatchStore rất vui được phục vụ quý khách. WatchStore hứa sẽ hoàn thiện hơn mỗi ngày để mang đến trải nghiệm tuyệt vời nhất có thể cho mọi khách hàng. Chúc quý khách mọi điều tốt lành!
          </p>
          <button className="bg-white border border-orange-500 text-orange-500 px-5 py-2 rounded hover:bg-orange-500 hover:text-white transition">
            Xem thêm
          </button>
        </div>
      </section>
    </div>
  );
}
