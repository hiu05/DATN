"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { themSP } from "@/lib/cartSlice";
import type { ISanPham } from "@/app/components/cautrucdata";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

/** Mở modal login qua global event + đánh dấu sẽ cuộn tới khối bình luận */
const triggerOpenLogin = () => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("scrollToComments", "1");
    window.dispatchEvent(new Event("open-login"));
  }
};

/** ========= Kiểu dữ liệu ========= */
interface Image { id?: number; image_url: string; is_main: number; }
interface Product {
  id: number; name: string; slug: string;
  price: number; discount_price: number; description: string;
  view: number; stock_quantity: number;
  gender?: string; brand?: { id: number; name: string };
  images?: Image[]; water_resistance?: string; movement_type?: string;
  strap_material?: string; crystal?: string; created_at?: string;
}
type RelatedItem = { id: number; name: string; slug: string; price: number; discount_price: number; images?: Image[]; };

type CommentItem = {
  id: number; user_id: number; product_id: number;
  rating: number; comment: string; created_at: string;
  user?: { id: number; name?: string; full_name?: string; email?: string };
};
type Summary = { average: number; count: number; histogram: Record<number, number>; };
type CurrentUser = { id: number; name?: string; email?: string; token?: string } | null;

/** Icon sao */
function Stars({ value }: { value: number }) {
  const v = Math.round(value);
  return (
    <div className="inline-flex gap-0.5 align-middle" aria-label={`${v} sao`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= v ? "text-yellow-500" : "text-gray-300"}>★</span>
      ))}
    </div>
  );
}

/** Tính lại summary từ list */
function recomputeSummary(list: CommentItem[]): Summary {
  const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const c of list) {
    const r = Math.max(1, Math.min(5, Math.round(c.rating)));
    histogram[r] = (histogram[r] || 0) + 1;
    sum += r;
  }
  const count = list.length;
  return { count, histogram, average: count ? Math.round((sum / count) * 10) / 10 : 0 };
}

/** Lấy tên hiển thị */
function getDisplayName(c: CommentItem) {
  return c.user?.full_name || c.user?.name || c.user?.email || `User #${c.user_id}`;
}

/** ==== Thumbnail scroller config ==== */
const PER_PAGE = 5;
const GAP_PX = 12; // đúng với class gap-3

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params!.slug[0] : (params?.slug as string);

  const [sp, setSp] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const viewIncremented = useRef(false);

  const [mainImg, setMainImg] = useState("/no-image.png");
  const [qty, setQty] = useState<number>(1);

  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // ====== Comments state ======
  const [cmtList, setCmtList] = useState<CommentItem[]>([]);
  const [cmtSummary, setCmtSummary] = useState<Summary | null>(null);
  const [cmtLoading, setCmtLoading] = useState(false);

  const [filter, setFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5 | "hasText">("all");
  const [visibleCount, setVisibleCount] = useState(4);

  const [myRating, setMyRating] = useState<number>(5);
  const [myComment, setMyComment] = useState<string>("");
  const [posting, setPosting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // user (localStorage)
  const [user, setUser] = useState<CurrentUser>(null);
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("auth_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  /** Lắng nghe login-success → reload + ghi dấu cuộn tới bình luận */
  useEffect(() => {
    const onLogin = () => {
      sessionStorage.setItem("scrollToComments", "1");
      window.location.reload();
    };
    window.addEventListener("login-success", onLogin);
    return () => window.removeEventListener("login-success", onLogin);
  }, []);

  /** Sau reload, nếu có cờ → cuộn tới #danh-gia */
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("scrollToComments") === "1") {
      sessionStorage.removeItem("scrollToComments");
      setTimeout(() => {
        document.getElementById("danh-gia")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, []);

  /** ====== COMMENTS ====== */
  async function loadComments(productId: number) {
    setCmtLoading(true);
    try {
      const res = await fetch(`${API}/api/comments?product_id=${productId}`, { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      let data: any = null;
      if (ct.includes("application/json")) { try { data = JSON.parse(raw); } catch {} }
      if (!res.ok || !data) { setCmtList([]); setCmtSummary(null); return; }

      let items: CommentItem[] = Array.isArray(data) ? data : [];
      if (!items.length && Array.isArray(data?.items)) items = data.items;
      if (!items.length && Array.isArray(data?.data)) items = data.data;
      if (!Array.isArray(items)) items = [];

      const summary: Summary | null =
        data?.summary && typeof data.summary === "object"
          ? data.summary
          : (items.length ? recomputeSummary(items) : null);

      setCmtList(items);
      setCmtSummary(summary);
    } catch {
      setCmtList([]); setCmtSummary(null);
    } finally {
      setCmtLoading(false);
    }
  }

  async function submitComment() {
    if (!sp?.id) return;
    if (!user?.id) { alert("Bạn cần đăng nhập để bình luận."); return; }
    if (!myComment.trim()) { alert("Vui lòng nhập nội dung."); return; }

    setPosting(true);
    setSuccessMsg("");

    // Optimistic
    const optimistic: CommentItem = {
      id: Date.now(),
      user_id: user.id,
      product_id: sp.id,
      rating: myRating,
      comment: myComment.trim(),
      created_at: new Date().toISOString(),
      user: { id: user.id, name: user?.name || user?.email || `User #${user.id}` },
    };

    setCmtList(prev => {
      const next = [optimistic, ...prev];
      setCmtSummary(recomputeSummary(next));
      return next;
    });

    try {
      const res = await fetch(`${API}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          product_id: sp.id,
          rating: myRating,
          comment: myComment.trim(),
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const raw = await res.text();
      let data: any = null;
      if (ct.includes("application/json")) { try { data = JSON.parse(raw); } catch {} }

      if (!res.ok) {
        setCmtList(prev => {
          const next = prev.filter(c => c.id !== optimistic.id);
          setCmtSummary(recomputeSummary(next));
          return next;
        });
        alert((data && (data.error || data.message)) || raw || "Không gửi được bình luận");
        return;
      }

      setMyComment("");
      setMyRating(5);
      setSuccessMsg("🎉 Gửi đánh giá thành công!");
      setTimeout(() => setSuccessMsg(""), 1800);

      await loadComments(sp.id);
    } finally {
      setPosting(false);
    }
  }

  /** ====== Fetch sản phẩm ====== */
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/sanpham/${slug}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data: Product = await res.json();

        const hinhChinh =
          data.images?.find(i => i.is_main === 1)?.image_url ||
          data.images?.[0]?.image_url ||
          "/no-image.png";
        setSp(data); setMainImg(hinhChinh); setLoading(false);

        if (data?.id && !viewIncremented.current) {
          viewIncremented.current = true;
          try {
            const up = await fetch(`${API}/api/tang-view/${data.id}`, { method: "POST" });
            if (up.ok) setSp(prev => (prev ? { ...prev, view: (prev.view || 0) + 1 } : prev));
          } catch {}
        }

        if (data?.id) loadComments(data.id);

        // liên quan
        try {
          setLoadingRelated(true);
          const url = data?.brand?.id ? `${API}/api/sanpham?brand=${data.brand.id}` : `${API}/api/sanpham`;
          const resList = await fetch(url, { cache: "no-store" });
          if (resList.ok) {
            const list: RelatedItem[] = await resList.json();
            setRelated(list.filter(p => p.id !== data.id).slice(0, 6));
          }
        } finally { setLoadingRelated(false); }

      } catch (e) { console.error("❌ Lỗi khi fetch sản phẩm:", e); setLoading(false); }
    })();
  }, [slug]);

  // ====== Tính số đếm & lọc theo tab ======
  const summaryNow = cmtSummary ?? recomputeSummary(cmtList);
  const starCount = summaryNow.histogram;
  const total = cmtList.length;
  const hasTextCount = cmtList.filter(c => (c.comment || "").trim().length > 0).length;

  const filtered = cmtList.filter(c => {
    if (filter === "all") return true;
    if (filter === "hasText") return (c.comment || "").trim().length > 0;
    return Math.round(c.rating) === filter;
  });

  const show = filtered.slice(0, visibleCount);
  useEffect(() => { setVisibleCount(4); }, [filter]);

  /** ==== Thumbnail scroller hooks — ĐẶT TRƯỚC MỌI EARLY RETURN ==== */
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 1;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < max);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    updateArrows();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [sp?.images?.length, mainImg]);

  const scrollByThumbs = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLButtonElement>("button[data-thumb='1']");
    const itemW = first ? first.offsetWidth + GAP_PX : 96;
    el.scrollBy({ left: dir * itemW * PER_PAGE, behavior: "smooth" });
  };

  /** EARLY RETURNS: đặt SAU tất cả hook ở trên */
  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (!sp) return <p>Không tìm thấy sản phẩm</p>;

  // ====== Derivatives cho UI ======
  const giaKM = Number(sp.discount_price || 0);
  const giaGoc = Number(sp.price || 0);
  const phanTram = giaGoc > giaKM ? `-${Math.round(((giaGoc - giaKM) / giaGoc) * 100)}%` : "";
  const stock = sp.stock_quantity ?? 0;
  const tongTien = giaKM * qty;

  const handleAddToCart = () => {
    if (!sp) return;
    if (stock === 0) { alert("Sản phẩm đã hết hàng!"); return; }
    dispatch(themSP({ sp: sp as unknown as ISanPham, qty }));
    alert("✅ Đã thêm vào giỏ!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        <a href="/" className="hover:underline">Trang chủ</a>
        <span> &gt; </span>
        <span className="text-gray-700">{sp.name}</span>
      </div>

      {/* Khối sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Ảnh */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center">
            <img
              src={mainImg}
              onError={(e) => (e.currentTarget.src = "/no-image.png")}
              className="w-full max-h-[520px] object-contain"
              alt={sp.name}
            />
          </div>

          {/* Thumbnails — chỉ 5 mỗi lượt, dư thì lướt */}
          <div className="relative mt-4">
            {/* Nút trái */}
            <button
              type="button"
              onClick={() => scrollByThumbs(-1)}
              disabled={!canLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow p-2
                         disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Xem ảnh trước"
              title="Trước"
            >
              ‹
            </button>

            {/* Dải thumbnail */}
            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth px-9 md:px-10 w-full md:w-[488px]"
            >
              {(sp.images ?? []).map((img, i) => (
                <button
                  key={img.id ?? i}
                  data-thumb="1"
                  onClick={() => setMainImg(img.image_url)}
                  className={`min-w-[88px] rounded-lg border p-1 transition snap-start
                    ${mainImg === img.image_url ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}`}
                  aria-label={`thumbnail ${i + 1}`}
                >
                  <img
                    src={img.image_url}
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                    className="h-20 w-20 object-cover rounded-md"
                    alt={`image ${i + 1}`}
                  />
                </button>
              ))}
            </div>

            {/* Nút phải */}
            <button
              type="button"
              onClick={() => scrollByThumbs(1)}
              disabled={!canRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow p-2
                         disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Xem ảnh tiếp"
              title="Tiếp"
            >
              ›
            </button>
          </div>
        </div>

        {/* Thông tin */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{sp.name}</h1>

          <div className="flex items-center gap-3 mb-2">
            {giaGoc > giaKM && (
              <span className="text-gray-500 line-through text-lg">
                {giaGoc.toLocaleString("vi-VN")} ₫
              </span>
            )}
            <span className="text-red-600 text-3xl font-extrabold">
              {giaKM.toLocaleString("vi-VN")} ₫
            </span>
            {phanTram && (
              <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">{phanTram}</span>
            )}
          </div>

          <div className="text-sm text-gray-700 space-y-1 mb-4">
            <div className="text-lg"><span className="font-semibold">Thương hiệu:</span> {sp.brand?.name ?? "—"}</div>
            <div className="text-lg"><span className="font-semibold">Giới tính:</span> {sp.gender ?? "Unisex"}</div>
            <div className="text-lg"><span className="font-semibold">Số lượng còn lại:</span> {stock}</div>
            <div className="text-lg"><span className="font-semibold">Lượt xem:</span> {sp.view.toLocaleString("vi-VN")}</div>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-700">Số lượng:</span>
              <div className="inline-flex rounded border border-gray-300">
                <button className="px-3 py-1" onClick={() => setQty(q => Math.max(1, q - 1))}>–</button>
                <div className="px-4 py-1 border-x border-gray-300">{qty}</div>
                <button className="px-3 py-1" onClick={() => setQty(q => Math.min(stock || 9999, q + 1))}>+</button>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              Tổng tiền: {tongTien.toLocaleString("vi-VN")} ₫
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-amber-50 border-amber-200 mb-5">
            <h3 className="font-semibold mb-2">⭐ Đặc quyền tại TIMEWATCH</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Giảm trực tiếp vào sản phẩm theo thời gian bảo hành.</li>
              <li>Đổi trả miễn phí nếu có lỗi sản xuất.</li>
              <li>Giảm giá đến 60% cho toàn bộ đồng hồ.</li>
              <li>Giao nhanh trong 2h (khu vực hỗ trợ).</li>
              <li>Ưu đãi thêm cho khách hàng thân thiết.</li>
            </ol>
          </div>

          <div className="text-sm text-gray-700 mb-5">
            <span className="font-semibold">Thông Tin Vận Chuyển:</span> Thời gian giao dự kiến: 3 - 5 ngày.
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow"
            >
              🛒 Thêm Vào Giỏ Hàng
            </button>
            <button
              onClick={() => router.push("/thanh-toan")}
              disabled={stock === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg shadow"
            >
              🚀 Mua Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Thông số & mô tả — 2 cột cân đối, không xuống dòng */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          Thông số sản phẩm {sp?.name ? `- ${sp.name}` : ""}
        </h2>

        {(() => {
          const specItems = [
            { label: "Thương hiệu", value: sp?.brand?.name },
            { label: "Đối tượng", value: sp?.gender },
            { label: "Chống nước", value: sp?.water_resistance },
            { label: "Loại máy", value: sp?.movement_type },
            { label: "Chất liệu kính", value: sp?.crystal },
            { label: "Chất liệu dây", value: sp?.strap_material },
            { label: "Ngày tạo sản phẩm", value: sp?.created_at },
            { label: "Số lượng tồn kho", value: sp?.stock_quantity },
          ];

          const mid = Math.ceil(specItems.length / 2);
          const left = specItems.slice(0, mid);
          const right = specItems.slice(mid);

          const Row = ({ label, value }: { label: string; value: any }) => (
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 w-44 md:w-48 lg:w-56 whitespace-nowrap">
                  {label}:
                </span>
                <span className="text-gray-700 flex-1 whitespace-nowrap overflow-x-auto">
                  {value ?? "Đang cập nhật"}
                </span>
              </div>
            </div>
          );

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-3">
                {left.map((row, i) => (
                  <Row key={`left-${i}`} label={row.label} value={row.value} />
                ))}
              </div>
              <div className="space-y-3">
                {right.map((row, i) => (
                  <Row key={`right-${i}`} label={row.label} value={row.value} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Mô tả chi tiết — toàn chiều rộng */}
        <div className="mt-6">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="font-semibold text-gray-800 mb-2">Mô tả chi tiết</div>
            <div className="text-gray-700 whitespace-pre-line">
              {sp?.description || "Đang cập nhật"}
            </div>
          </div>
        </div>
      </div>

      {/* ====== ĐÁNH GIÁ & BÌNH LUẬN – đặt ngay dưới mô tả ====== */}
      <section id="danh-gia" className="relative rounded-2xl border bg-white/60 backdrop-blur p-6 ring-1 ring-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-blue-50" />
        <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">Đánh giá & Bình luận</h2>

        {/* Toast */}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            {successMsg}
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl bg-white/70 border p-4 mb-4">
          {summaryNow.count > 0 ? (
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="text-5xl font-extrabold text-gray-900">{summaryNow.average.toFixed(1)}</div>
              <div>
                <Stars value={summaryNow.average} />
                <div className="text-sm text-gray-600">{summaryNow.count} lượt đánh giá</div>
              </div>
            </div>
          ) : (
            <div className="text-orange-600">Chưa có đánh giá.</div>
          )}
        </div>

        {/* Tabs lọc */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { k: "all", label: "Tất cả", cnt: total },
            { k: 5, label: "5 Sao", cnt: starCount[5] },
            { k: 4, label: "4 Sao", cnt: starCount[4] },
            { k: 3, label: "3 Sao", cnt: starCount[3] },
            { k: 2, label: "2 Sao", cnt: starCount[2] },
            { k: 1, label: "1 Sao", cnt: starCount[1] },
            { k: "hasText", label: "Có Bình Luận", cnt: hasTextCount },
          ] as const).map(t => (
            <button
              key={String(t.k)}
              onClick={() => setFilter(t.k as any)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition ${filter === t.k ? "bg-orange-600 text-black border-black" : "bg-white hover:bg-gray-50"}`}
            >
              {t.label} <span className="opacity-70">({t.cnt})</span>
            </button>
          ))}
        </div>

        {/* Form bình luận */}
        <div className="rounded-2xl border bg-gray-200 p-5">
          <div className="mb-2 font-semibold text-gray-900">Viết đánh giá của bạn</div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-gray-700">Chấm sao:</span>
            <div className="inline-flex gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => user?.id && setMyRating(s)}
                  className={`transition hover:scale-110 ${s <= myRating ? "text-yellow-500" : "text-gray-300"}`}
                  aria-label={`${s} sao`}
                  disabled={!user?.id}
                  title={!user?.id ? "Đăng nhập để chấm sao" : ""}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600">{myRating}/5</span>
          </div>

          <textarea
            className="w-full rounded-xl border bg-white p-3 outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
            rows={3}
            placeholder={user?.id ? "Chia sẻ cảm nhận của bạn…" : "Vui lòng đăng nhập để viết đánh giá…"}
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            disabled={!user?.id}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={submitComment}
              disabled={posting || !user?.id}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 disabled:opacity-60"
            >
              {posting ? "Đang gửi…" : "Gửi đánh giá"}
            </button>
            {!user?.id && (
              <span className="text-sm text-gray-600">
                Bạn cần{" "}
                <button
                  type="button"
                  onClick={triggerOpenLogin}
                  className="underline hover:text-blue-600"
                >
                  đăng nhập
                </button>{" "}
                để bình luận.
              </span>
            )}
          </div>
        </div>

        {/* Danh sách bình luận */}
        <div className="mt-6 space-y-4">
          {cmtLoading && <div>Đang tải bình luận…</div>}
          {!cmtLoading && filtered.length === 0 && <div className="text-gray-500">Chưa có bình luận cho mục này.</div>}

          {show.map((c) => {
            const displayName = getDisplayName(c);
            const initials = displayName.trim().charAt(0).toUpperCase() || "U";
            return (
              <div key={c.id} className="rounded-xl border bg-white p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{displayName}</div>
                    <Stars value={c.rating} />
                  </div>
                  <div className="mt-1 text-gray-800 leading-relaxed whitespace-pre-line">{c.comment}</div>
                  <div className="mt-1 text-xs text-gray-500">{new Date(c.created_at).toLocaleString("vi-VN")}</div>
                </div>
              </div>
            );
          })}

          {/* Xem thêm / Thu gọn */}
          {filtered.length > 0 && (
            <div className="flex justify-center pt-2">
              {visibleCount < filtered.length ? (
                <button
                  onClick={() => setVisibleCount(v => v + 5)}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                >
                  Xem thêm
                </button>
              ) : filtered.length > 4 ? (
                <button
                  onClick={() => setVisibleCount(4)}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                >
                  Thu gọn
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Sản phẩm liên quan (đặt dưới bình luận) */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold uppercase text-orange-500 text-center mb-6">
          Sản Phẩm Liên Quan
        </h2>
        {loadingRelated && <p>Đang tải sản phẩm liên quan...</p>}
        {related.length === 0 && !loadingRelated && (
          <p className="text-center text-gray-500">Không có sản phẩm liên quan</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {related.slice(0, 6).map((p) => {
            const price = Number(p.discount_price || 0);
            const origin = Number(p.price || 0);
            const img = p.images?.find(i => i.is_main === 1)?.image_url || p.images?.[0]?.image_url || "/no-image.png";
            const sale = origin > price ? `-${Math.round(((origin - price) / origin) * 100)}%` : "";
            return (
              <Link
                key={p.id}
                href={`/san-pham/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white transition hover:shadow-xl hover:-translate-y-0.5 hover:ring-1 hover:ring-gray-200"
              >
                <div className="relative overflow-hidden rounded-t-2xl bg-white flex items-center justify-center">
                  <img
                    src={img}
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                    alt={p.name}
                    className="h-24 md:h-24 object-contain p-2 transition duration-300 group-hover:scale-105"
                  />
                  {sale && (
                    <span className="absolute top-2 left-2 text-[11px] px-1.5 py-0.5 rounded-md bg-red-500/90 text-white shadow-sm">
                      {sale}
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-gray-900 min-h-[36px]">
                    {p.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-red-600 font-semibold text-sm">{price.toLocaleString("vi-VN")}</span>
                    {origin > price && (
                      <span className="text-gray-400 line-through text-xs">{origin.toLocaleString("vi-VN")}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
