"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { suaSL, xoaSP, selectCartItems } from "@/lib/cartSlice";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= Helpers Ảnh & Giá ================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
const FALLBACK_IMG = "/images/no-image.webp";

const normalizePath = (s?: string) =>
  (s || "").trim().replace(/\\/g, "/").replace(/^public\//, "").replace(/^\/+/, "");

const withBase = (u?: string) => {
  const p = normalizePath(u);
  if (!p) return FALLBACK_IMG;
  if (/^https?:\/\//i.test(p)) return p;
  return p.startsWith("upload/") ? `${API_BASE}/${p}` : `/${p}`;
};

const getOriginPrice = (sp: any) => Number(sp.gia_price ?? sp.price ?? 0);
const getDiscountPrice = (sp: any) => Number(sp.gia_km ?? sp.discount_price ?? 0);
const getPayPrice = (sp: any) => {
  const g = getOriginPrice(sp);
  const km = getDiscountPrice(sp);
  return km > 0 && km < g ? km : g;
};
const getStock = (sp: any) => Math.max(0, Number(sp.stock_quantity ?? 0));
const getName = (sp: any) => sp.ten_sp ?? sp.name ?? "Sản phẩm";

/* ================== Trang Giỏ Hàng =================== */
export default function GioHangPage() {
  const cart = useSelector((s: RootState) => selectCartItems(s));
  const dispatch = useDispatch();
  const router = useRouter();

  // Ảnh/stock từ DB để “cứu hộ” item cũ chưa có image_url
  const [liveMap, setLiveMap] = useState<Record<number, { image?: string }>>({});

  useEffect(() => {
    if (!cart || cart.length === 0) {
      router.push("/");
      return;
    }
    // hydrate ảnh nếu thiếu
    const ids = cart.filter((x: any) => !x.image_url).map((x: any) => x.id);
    if (ids.length === 0) return;

    (async () => {
      try {
        const res = await fetch(`/api/sanpham?ids=${ids.join(",")}`, { cache: "no-store" });
        if (!res.ok) return;
        const list = await res.json(); // [{id, images, image_url, ...}]
        const next: Record<number, { image?: string }> = {};
        for (const p of list || []) {
          const raw =
            p?.images?.find((i: any) => Number(i?.is_main) === 1)?.image_url ||
            p?.images?.[0]?.image_url ||
            p?.image_url ||
            p?.images_url?.[0] ||
            p?.url ||
            p?.image ||
            p?.path ||
            "";
          next[p.id] = { image: raw };
        }
        setLiveMap(next);
      } catch {
        // ignore
      }
    })();
  }, [cart, router]);

  // lấy ảnh với rất nhiều fallback
  const getImage = (sp: any) => {
    const candidate =
      sp?.image_url || // ảnh đã được chuẩn hoá khi addToCart
      sp?.image_path || // nếu bạn lưu raw path
      sp?.images?.find((i: any) => Number(i?.is_main) === 1)?.image_url ||
      sp?.images?.[0]?.image_url ||
      sp?.images_url?.[0] ||
      sp?.url ||
      sp?.image ||
      sp?.path ||
      liveMap[sp?.id]?.image || // ảnh lấy lại từ DB
      "";
    return withBase(candidate);
  };

  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showInput, setShowInput] = useState(false);

  const subtotal = useMemo(() => {
    return cart.reduce((sum: number, sp: any) => {
      const price = getPayPrice(sp);
      return sum + price * Number(sp.so_luong || 0);
    }, 0);
  }, [cart]);

  const discountValue = Math.floor((discountPercent / 100) * subtotal);
  const finalTotal = subtotal - discountValue;

  const handleDiscountApply = () => {
    const code = discountCode.trim().toLowerCase();
    if (code === "giam10") setDiscountPercent(10);
    else if (code === "giam20") setDiscountPercent(20);
    else {
      alert("Mã giảm giá không hợp lệ");
      setDiscountPercent(0);
    }
  };

  const invalidItems = cart.filter((sp: any) => {
    const stock = getStock(sp);
    return stock === 0 || Number(sp.so_luong) > stock;
  });
  const canCheckout = invalidItems.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
      {/* Danh sách sản phẩm */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-700 uppercase">Sản phẩm</h2>

        {cart.map((sp: any) => {
          const name = getName(sp);
          const origin = getOriginPrice(sp);
          const dprice = getDiscountPrice(sp);
          const price = getPayPrice(sp);

          const saved = Math.max(0, origin - price);
          const stock = getStock(sp);
          const atMax = stock > 0 && Number(sp.so_luong) >= stock;

          const dec = () => {
            if (sp.so_luong > 1) dispatch(suaSL([sp.id, sp.so_luong - 1]));
          };
          const inc = () => {
            if (stock === 0) return;
            if (sp.so_luong < stock) dispatch(suaSL([sp.id, sp.so_luong + 1]));
          };

          return (
            <div key={sp.id} className="grid grid-cols-[100px_1fr_100px] gap-4 border-b py-6 items-center">
              <img
                src={getImage(sp)}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                className="w-24 h-24 object-contain border bg-white"
                alt={name}
              />

              <div>
                <h3 className="text-base font-semibold text-gray-800">{name}</h3>

                <div className="flex items-center gap-2 my-1">
                  {dprice > 0 && dprice < origin && (
                    <span className="text-sm line-through text-gray-400">
                      {origin.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                  <span className="text-sm text-gray-800">
                    {price.toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {saved > 0 && (
                  <span className="inline-block bg-gray-200 text-xs px-2 py-1 font-semibold rounded">
                    Tiết Kiệm {saved.toLocaleString("vi-VN")} ₫
                  </span>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={dec}
                    className="w-8 h-8 border border-gray-400 rounded text-xl hover:bg-gray-200"
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>

                  <span className="min-w-[30px] text-center">{sp.so_luong}</span>

                  <button
                    onClick={inc}
                    disabled={atMax || stock === 0}
                    className={`w-8 h-8 border border-gray-400 rounded text-xl ${
                      atMax || stock === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                    }`}
                    aria-label="Tăng số lượng"
                    title={
                      stock === 0
                        ? "Sản phẩm đã hết hàng"
                        : atMax
                        ? `Chỉ còn ${stock} sản phẩm trong kho`
                        : ""
                    }
                  >
                    +
                  </button>
                </div>

                {/* Thông tin tồn kho */}
                <div className="text-xs mt-1">
                  {stock > 0 ? (
                    <span className={`${atMax ? "text-red-600" : "text-gray-500"}`}>
                      Còn {stock.toLocaleString("vi-VN")} sản phẩm
                      {atMax ? " • Bạn đã chọn tối đa" : ""}
                    </span>
                  ) : (
                    <span className="text-red-600">Hết hàng</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const ok = confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi giỏ hàng?`);
                    if (ok) dispatch(xoaSP(sp.id));
                  }}
                  className="text-sm text-blue-600 underline mt-2 inline-block"
                >
                  Xóa sản phẩm
                </button>
              </div>

              <div className="text-right font-bold text-gray-800">
                {(price * Number(sp.so_luong || 0)).toLocaleString("vi-VN")}₫
              </div>
            </div>
          );
        })}

        {invalidItems.length > 0 && (
          <div className="mt-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
            Một số sản phẩm vượt quá số lượng còn lại hoặc đã hết hàng. Vui lòng điều chỉnh trước khi thanh toán.
          </div>
        )}
      </div>

      {/* Tổng đơn hàng */}
      <div className="bg-gray-50 p-6 rounded border shadow">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">TỔNG CỘNG GIỎ HÀNG</h3>

        <div className="mb-4 border-b pb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowInput(!showInput)}
          >
            <span className="text-gray-800">Thêm mã giảm giá</span>
            <span className="text-xl">{showInput ? "˄" : "⌄"}</span>
          </div>

          {showInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Nhập mã"
                className="border p-2 flex-1 rounded"
              />
              <button
                onClick={handleDiscountApply}
                disabled={!discountCode.trim()}
                className={`px-6 py-2 rounded w-full font-bold text-white ${
                  !discountCode.trim()
                    ? "bg-gray-500 opacity-70 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                ÁP DỤNG
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString("vi-VN")} ₫</span>
        </div>

        {discountPercent > 0 && (
          <div className="flex justify-between text-sm text-green-700">
            <span>Giảm {discountPercent}%</span>
            <span>-{discountValue.toLocaleString("vi-VN")} ₫</span>
          </div>
        )}

        <div className="flex justify-between mb-2">
          <span>Free shipping</span>
          <span className="font-semibold">MIỄN PHÍ</span>
        </div>

        <div className="flex justify-between text-xl font-bold border-t pt-4 mt-2">
          <span>Tổng ước tính</span>
          <span>{finalTotal.toLocaleString("vi-VN")} ₫</span>
        </div>

        <button
          onClick={() => router.push("/thanh-toan")}
          disabled={!canCheckout}
          title={!canCheckout ? "Có sản phẩm vượt tồn kho hoặc hết hàng. Vui lòng điều chỉnh số lượng." : ""}
          className={`w-full mt-6 text-white py-3 rounded text-center text-base font-semibold
            ${!canCheckout ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  );
}
