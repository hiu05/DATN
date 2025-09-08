"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import AuthModal from "./AuthModal";
import DangNhapForm from "./DangNhapForm";
import DangKyForm from "./DangKyForm";
import QuenMatKhauForm from "./QuenMatKhauForm";
import AccountInfoModal from "./AccountInfoModal";
import { extractWishlistIds } from "../utils/wishlist";

type SearchItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  images?: { image_url: string; is_main?: number }[];
};

export default function ThanhMenu() {
  const router = useRouter();

  // ===== Cart (Redux only)
  const items = useSelector((s: any) => s.cart?.listSP ?? []);
  const cartCount = items.reduce((sum: number, i: any) => sum + (i?.so_luong ?? 0), 0);

  // ===== User + Account menu
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);

  // ===== Wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  // ===== Live Search
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // ---------- helpers ----------
  const readUser = () => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("auth_user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  };

  const loadWishlistCount = async (uid?: number) => {
    try {
      if (uid) {
        const res = await fetch(`${apiBase}/api/wishlist`, {
          headers: { "x-user-id": String(uid) },
          cache: "no-store",
        });
        const data = await res.json();
        const ids = extractWishlistIds(data);
        setWishlistCount(ids.length);
      } else {
        const fav = localStorage.getItem("favorites");
        const wl = localStorage.getItem("wishlist");
        const len = fav
          ? (JSON.parse(fav) as number[]).length
          : wl
          ? (JSON.parse(wl) as number[]).length
          : 0;
        setWishlistCount(len);
      }
    } catch {
      setWishlistCount(0);
    }
  };

  // ✅ Toggle yêu thích
  const toggleFavorite = (id: number) => {
    let favorites: number[] = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    if (favorites.includes(id)) {
      favorites = favorites.filter((x) => x !== id);
    } else {
      favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));

    loadWishlistCount(user?.id);
    window.dispatchEvent(new Event("wishlist:update"));
  };

  const imgOf = (it: SearchItem) =>
    (it.images && it.images[0]?.image_url) || "/no-image.png";

  // ---------- effects ----------
  useEffect(() => {
    readUser();

    const flag = localStorage.getItem("openLoginAfterReset");
    if (flag) {
      setOpenLogin(true);
      localStorage.removeItem("openLoginAfterReset");
    }

    const onUserChanged = () => readUser();
    window.addEventListener("user-changed", onUserChanged);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") readUser();
      if (e.key === "favorites" || e.key === "wishlist") {
        loadWishlistCount(user?.id);
      }
    };
    window.addEventListener("storage", onStorage);

    const openLoginEvt = () => setOpenLogin(true);
    window.addEventListener("open-login", openLoginEvt as any);

    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);

    const onWishlistUpdate = () => loadWishlistCount(user?.id);
    window.addEventListener("wishlist:update", onWishlistUpdate as any);
    window.addEventListener("wishlist-changed", onWishlistUpdate as any);

    return () => {
      window.removeEventListener("user-changed", onUserChanged);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("open-login", openLoginEvt as any);
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("wishlist:update", onWishlistUpdate as any);
      window.removeEventListener("wishlist-changed", onWishlistUpdate as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadWishlistCount(user?.id);
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target as Node)) setOpenSearch(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!keyword || keyword.trim().length < 2) {
      setResults([]);
      setNoResult(false);
      setOpenSearch(false);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const url = new URL(`${apiBase}/api/sanpham/search`);
        url.searchParams.set("q", keyword.trim());
        url.searchParams.set("page", "1");
        url.searchParams.set("pageSize", "8");
        const res = await fetch(url.toString(), { signal: ctrl.signal });
        const data = await res.json();
        const items: SearchItem[] = Array.isArray(data)
          ? data
          : data.items || [];
        setResults(items);
        setNoResult(items.length === 0);
        setOpenSearch(true);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Lỗi tìm kiếm:", err);
          setResults([]);
          setNoResult(true);
          setOpenSearch(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [keyword, apiBase]);

  // ---------- handlers ----------
  const doLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("user-changed"));
    setMenuOpen(false);
    setOpenLogoutConfirm(false);
    loadWishlistCount(undefined);
  };

  const afterLogin = (loggedUser?: any) => {
    if (loggedUser) {
      localStorage.setItem("user", JSON.stringify(loggedUser));
    }
    window.dispatchEvent(new Event("user-changed"));
    setOpenLogin(false);
  };

  const onUserIconClick = () => {
    if (!user) {
      setOpenLogin(true);
      return;
    }
    setMenuOpen((v) => !v);
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const q = keyword.trim();
      if (q) {
        setOpenSearch(false);
        router.push(`/san-pham?q=${encodeURIComponent(q)}`);
      }
    } else if (e.key === "Escape") {
      setOpenSearch(false);
    }
  };

  // Khởi tạo từ localStorage (trường hợp chưa có event)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('favorites') || localStorage.getItem('wishlist');
      const arr = raw ? JSON.parse(raw) : [];
      setWishlistCount(Array.isArray(arr) ? arr.length : 0);
    } catch {}
  }, []);

  // Lắng nghe sự kiện từ Home (và các trang khác)
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<number>;
      if (typeof ce.detail === 'number') setWishlistCount(ce.detail);
    };
    window.addEventListener('wishlist:update', handler);
    return () => window.removeEventListener('wishlist:update', handler);
  }, []);

  return (
    <div className="w-full flex items-center justify-between h-[60px] px-6 bg-gray-100 text-gray-800 shadow-sm rounded-md">
      {/* Logo + Tên */}
      <div className="flex items-center space-x-3">
        <img
          src="/images/logo.jpg"
          alt="Logo"
          className="h-16 w-auto object-contain"
        />
        <span className="text-2xl font-bold tracking-wide text-black">
          TIMEWATCH
        </span>
      </div>

      {/* Menu chính */}
      <ul className="hidden md:flex items-center space-x-6 text-[16px] font-medium">
        <li>
          <Link href="/" className="hover:text-black transition">
            Trang Chủ
          </Link>
        </li>
        <li>
          <Link href="/san-pham" className="hover:text-black">
            Sản Phẩm
          </Link>
        </li>
        <li>
          <Link href="/gioi-thieu" className="hover:text-black">
            Giới Thiệu
          </Link>
        </li>
        <li>
          <Link href="/tin-tuc" className="hover:text-black">
            Tin Tức
          </Link>
        </li>
        <li>
          <Link href="/lien-he" className="hover:text-black">
            Liên Hệ
          </Link>
        </li>
      </ul>

      {/* Search + Icons */}
      <div className="flex items-center gap-4">
        {/* SEARCH (live dropdown) */}
        <div className="relative" ref={searchBoxRef}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="🔍 Tìm là thấy"
            aria-label="Tìm kiếm sản phẩm"
            className="w-64 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black bg-white"
            onFocus={() => {
              if (results.length > 0 || noResult) setOpenSearch(true);
            }}
          />

          {openSearch && (
            <div className="absolute z-50 mt-2 w-[22rem] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {loading && (
                <div className="p-3 text-sm text-gray-500">Đang tìm…</div>
              )}
              {!loading && noResult && (
                <div className="p-3 text-sm text-red-600">
                  Sản phẩm không tồn tại
                </div>
              )}
              {!loading && results.length > 0 && (
                <ul className="max-h-80 overflow-auto">
                  {results.map((it) => (
                    <li key={it.id} className="hover:bg-gray-50">
                      <Link
                        href={`/san-pham/${it.slug}`}
                        className="flex items-center gap-3 p-3 text-sm"
                        onClick={() => setOpenSearch(false)}
                      >
                        <img
                          src={imgOf(it)}
                          alt={it.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 line-clamp-1">
                            {it.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(
                              it.discount_price ?? it.price
                            ).toLocaleString("vi-VN")}
                            ₫
                          </div>
                        </div>
                      </Link>
                      {/* Nút ❤️ toggle ngay ở kết quả tìm kiếm */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(it.id);
                        }}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <FiHeart />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Giỏ hàng */}
       <Link href="/gio-hang" className="relative">
            <FiShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

        {/* Yêu thích */}
        <Link href="/yeu-thich" className="relative">
            <FiHeart className="text-2xl" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

        {/* Đăng nhập / Tài khoản */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={onUserIconClick}
            aria-label="Tài khoản"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            <FiUser className="text-2xl hover:text-black transition cursor-pointer" />
          </button>

          {menuOpen && user && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-3 z-50">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-semibold text-gray-700">
                    {(user.full_name || user.name || user.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {user.full_name || user.name || "Người dùng"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpenAccount(true);
                  }}
                >
                  Thông Tin Tài Khoản
                </button>
              </div>

              <div className="border-t pt-2">
                <button
                  onClick={() => setOpenLogoutConfirm(true)}
                  className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
                >
                  Đăng Xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modals ===== */}
      <AuthModal open={openLogin} onClose={() => setOpenLogin(false)} title="Đăng nhập">
        <DangNhapForm
          onSuccess={(loggedUser?: any) => afterLogin(loggedUser)}
          onSwitchToSignup={() => {
            setOpenLogin(false);
            setOpenSignup(true);
          }}
          onSwitchToForgot={() => {
            setOpenLogin(false);
            setOpenForgot(true);
          }}
        />
      </AuthModal>

      <AuthModal
        open={openLogoutConfirm}
        onClose={() => setOpenLogoutConfirm(false)}
        title="Xác nhận đăng xuất"
      >
        <p className="text-sm text-gray-700 mb-4">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenLogoutConfirm(false)}
            className="flex-1 h-10 rounded border hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={doLogout}
            className="flex-1 h-10 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </AuthModal>

      <AuthModal
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        title="Đăng ký thành viên"
      >
        <DangKyForm
          onSuccess={() => setOpenSignup(false)}
          onSwitchToLogin={() => {
            setOpenSignup(false);
            setOpenLogin(true);
          }}
        />
      </AuthModal>

      <AuthModal open={openForgot} onClose={() => setOpenForgot(false)} title="Quên mật khẩu">
        <QuenMatKhauForm
          onSuccess={() => setOpenForgot(false)}
          onSwitchToLogin={() => {
            setOpenForgot(false);
            setOpenLogin(true);
          }}
          onSwitchToSignup={() => {
            setOpenForgot(false);
            setOpenSignup(true);
          }}
        />
      </AuthModal>

      <AccountInfoModal open={openAccount} onClose={() => setOpenAccount(false)} />
    </div>
  );
}
