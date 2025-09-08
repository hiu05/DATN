// /app/thanh-toan/page.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

/** ===== Kiểu dữ liệu linh hoạt cho giỏ hàng ===== */
type AnyImage =
  | string
  | { image_url?: string; url?: string; src?: string; is_main?: number };

type CartRow = {
  id: number;
  ten_sp?: string;
  name?: string;
  gia_price?: number;
  gia_km?: number;
  price?: number;
  discount_price?: number;
  unit_price?: number;
  so_luong: number;
  image_url?: string;
  image?: AnyImage | AnyImage[];
  images?: AnyImage[];
  hinh?: AnyImage | AnyImage[];
};

type Root = {
  cart: { listSP: CartRow[] };
  auth?: { user?: any; token?: string };
  user?: { profile?: any };
};

type CouponResult = {
  code: string;
  type: "percent" | "amount";
  value: number;
  message?: string;
};

const AUTH_KEYS = ["auth_token", "access_token", "user", "tw_user", "token", "my_token"];

export default function ThanhToan() {
  const listSP: CartRow[] = useSelector((s: Root) => s.cart.listSP);
  console.log("Giỏ hàng:", listSP);
  const userFromRedux = useSelector((s: Root) => s.auth?.user || s.user?.profile || null);
  const tokenFromRedux = useSelector((s: Root) => (s as any)?.auth?.token || null);
  
  const router = useRouter();

  // === Thêm VNPay & Bank vào paymentMethod
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | "vnpay" | "stripe">("cod");
  const [orderCode, setOrderCode] = useState("");
  const [loading, setLoading] = useState(false);

  // ====== Auth guard + auto refresh khi login/logout ở chỗ khác ======
  const [authed, setAuthed] = useState<boolean>(false);
  const prevAuthed = useRef<boolean | null>(null);
  const authSigRef = useRef<string>("");

  const readAuthSig = () => {
    if (typeof window === "undefined") return "";
    try {
      const parts: string[] = [];
      const ls = window.localStorage;
      for (const k of AUTH_KEYS) parts.push(ls.getItem(k) || "");
      parts.push((document.cookie || "").match(/(?:^|;\s*)(auth_token|access_token|token)=([^;]+)/)?.[0] || "");
      return parts.join("|");
    } catch {
      return "";
    }
  };

  const computeAuth = () => {
    let ok = !!userFromRedux || !!tokenFromRedux;
    if (!ok && typeof window !== "undefined") {
      const ls = window.localStorage;
      for (const k of AUTH_KEYS) {
        if (ls.getItem(k)) { ok = true; break; }
      }
      if (!ok && /(^|;\s*)(auth_token|access_token|token)=/.test(document.cookie || "")) ok = true;
    }
    return ok;
  };

  useEffect(() => { setAuthed(computeAuth()); }, [userFromRedux, tokenFromRedux]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tick = () => {
      const sig = readAuthSig();
      if (sig !== authSigRef.current) {
        authSigRef.current = sig;
        const ok = computeAuth();
        if (prevAuthed.current === null) prevAuthed.current = ok;
        const changed = prevAuthed.current !== ok;
        prevAuthed.current = ok;
        setAuthed(ok);
        if (changed) router.refresh();
      }
    };
    tick();
    const id = window.setInterval(tick, 700);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // validate state
  const [errName, setErrName] = useState("");
  const [errAddress, setErrAddress] = useState("");
  const [errCity, setErrCity] = useState("");
  const [errPhone, setErrPhone] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);

  // coupon state
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!listSP || listSP.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào. Vui lòng chọn sản phẩm trước khi thanh toán.");
      router.push("/");
      return;
    }
    setOrderCode(`DH${Math.floor(100000 + Math.random() * 900000)}`);
  }, [listSP, router]);

  // refs form
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Prefill form
  const didPrefill = useRef(false);
  useEffect(() => {
    if (didPrefill.current) return;
    if (!authed) return;
    try {
      const u = userFromRedux || {};
      if (nameRef.current && (u.full_name || u.ho_ten)) nameRef.current.value = u.full_name || u.ho_ten || "";
      if (addressRef.current && (u.address || u.dia_chi)) addressRef.current.value = u.address || u.dia_chi || "";
      if (cityRef.current && (u.city || u.thanh_pho)) cityRef.current.value = u.city || u.thanh_pho || "";
      if (phoneRef.current && (u.phone || u.dien_thoai)) phoneRef.current.value = u.phone || u.dien_thoai || "";
      if (emailRef.current) {
        const last = localStorage.getItem("last_checkout_email") || "";
        emailRef.current.value = u.email || last || "";
      }
      didPrefill.current = true;
    } catch { }
  }, [authed, userFromRedux]);

  /** ===== Helpers: Ảnh / Giá / Tên ===== */
  function pickCartImage(sp: CartRow): string {
    if (sp?.image_url) return attachBaseIfNeeded(sp.image_url);
    const collect = (): AnyImage[] => {
      const a: AnyImage[] = [];
      if (Array.isArray(sp.images)) a.push(...sp.images);
      if (Array.isArray(sp.image)) a.push(...sp.image);
      if (sp.hinh) a.push(...(Array.isArray(sp.hinh) ? sp.hinh : [sp.hinh]));
      return a;
    };
    const arr = collect();
    if (arr.length === 0) return "/default.jpg";
    const toUrl = (x: AnyImage) => (typeof x === "string" ? x : x?.image_url || x?.url || x?.src || "");
    const main = arr.find((x) => typeof x !== "string" && x?.is_main === 1) || arr[0];
    const raw = toUrl(main) || toUrl(arr[0]);
    return raw ? attachBaseIfNeeded(raw) : "/default.jpg";
  }

  function attachBaseIfNeeded(raw: string): string {
    const base = typeof window !== "undefined" ? ((process.env.NEXT_PUBLIC_IMAGE_BASE as string) || "") : "";
    if (!raw) return "/default.jpg";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return base + raw;
    return base ? base.replace(/\/$/, "") + "/" + raw.replace(/^\//, "") : raw;
  }

  function pickCartPrice(sp: CartRow): number {
    const km = toNum(sp.gia_km ?? sp.discount_price);
    const goc = toNum(sp.gia_price ?? sp.price ?? sp.unit_price);
    if (km > 0 && goc > 0 && km < goc) return km;
    if (goc > 0) return goc;
    return 0;
  }

  function toNum(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function pickCartName(sp: CartRow): string {
    return sp.ten_sp || (sp as any).name || `Sản phẩm #${sp.id}`;
  }

  /** ===== Tính tiền ===== */
  const subTotal = useMemo(
    () => listSP.reduce((sum, sp) => sum + pickCartPrice(sp) * (sp.so_luong || 1), 0),
    [listSP]
  );

  const discountValue = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percent") return Math.floor((subTotal * coupon.value) / 100);
    return Math.min(subTotal, Math.max(0, Math.floor(coupon.value)));
  }, [coupon, subTotal]);

  const totalClient = useMemo(() => Math.max(0, subTotal - discountValue), [subTotal, discountValue]);

  /** ===== Validators ===== */
  const isValidName = (s: string) => {
    const parts = s.trim().split(/\s+/);
    return parts.length >= 2 && parts.every((p) => p.length >= 2);
  };
  const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  const isValidPhoneVN = (s: string) => /^(0|\+84)\d{9,10}$/.test(s.replace(/\s+/g, ""));
  const requireNonEmpty = (s: string) => s.trim().length > 0;

  const validateAll = () => {
    const full_name = nameRef.current?.value || "";
    const address = addressRef.current?.value || "";
    const city = cityRef.current?.value || "";
    const phone = phoneRef.current?.value || "";
    const email = emailRef.current?.value || "";
    let ok = true;

    if (!isValidName(full_name)) { setErrName("Vui lòng nhập Họ & Tên đầy đủ (ít nhất 2 từ)."); ok = false; } else setErrName("");
    if (!requireNonEmpty(address)) { setErrAddress("Vui lòng nhập địa chỉ."); ok = false; } else setErrAddress("");
    if (!requireNonEmpty(city)) { setErrCity("Vui lòng nhập Thị trấn/Thành phố."); ok = false; } else setErrCity("");
    if (!isValidPhoneVN(phone)) { setErrPhone("Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)."); ok = false; } else setErrPhone("");
    if (!isValidEmail(email)) { setErrEmail("Email không hợp lệ (VD: username@example.com)."); ok = false; } else setErrEmail("");
    return ok;
  };

  /** ===== Coupon ===== */
  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    setCouponMsg("");
    if (!code) { setCoupon(null); setCouponMsg("Vui lòng nhập mã giảm giá."); return; }
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const j = await res.json();
        if (j?.type && (j.type === "percent" || j.type === "amount") && typeof j.value === "number") {
          setCoupon({ code, type: j.type, value: j.value, message: j.message });
          setCouponMsg(j.message || "Áp dụng mã thành công."); return;
        }
      }
    } catch { }
    if (code === "SALE10") { setCoupon({ code, type: "percent", value: 10, message: "Đã áp dụng giảm 10%." }); setCouponMsg("Đã áp dụng giảm 10%."); }
    else if (code === "GIAM50K" || code === "GIAM50000") { setCoupon({ code, type: "amount", value: 50000, message: "Đã giảm 50.000₫." }); setCouponMsg("Đã giảm 50.000₫."); }
    else { setCoupon(null); setCouponMsg("Mã giảm giá không hợp lệ."); }
  };

  // ==== VietQR env (client) ====
  // const bankBin = process.env.NEXT_PUBLIC_VIETQR_BANK_BIN || "";   // ví dụ: 970436
  // const bankAcc = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "";  // số TK
  // const bankName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || ""; // chủ TK

  const amountInt = useMemo(() => Math.max(0, Math.floor(totalClient)), [totalClient]);
  // const vietQrUrl = useMemo(() => {
  //   if (!bankBin || !bankAcc) return "";
  //   const info = encodeURIComponent(orderCode || "Thanh toan don hang");
  //   return `https://img.vietqr.io/image/${bankBin}-${bankAcc}-qr_only.png?amount=${amountInt}&addInfo=${info}`;
  // }, [bankBin, bankAcc, amountInt, orderCode]);

  // const copyToClipboard = async (t: string) => {
  //   try { await navigator.clipboard.writeText(t); msgRef.current!.innerHTML = "Đã copy!"; setTimeout(() => { if (msgRef.current) msgRef.current.innerHTML = ""; }, 1200); }
  //   catch { msgRef.current!.innerHTML = "Không thể copy."; }
  // };

  const bankBoxRef = useRef<HTMLDivElement>(null);

  /** ===== Submit checkout (đăng nhập cũ giữ nguyên) ===== */
  const submitCheckout = async () => {
    if (!authed) { msgRef.current!.innerHTML = "⚠️ Bạn cần đăng nhập để tiếp tục thanh toán."; return; }
    if (!listSP?.length) { msgRef.current!.innerHTML = "Giỏ hàng trống."; return; }
    msgRef.current!.innerHTML = "";
    if (!validateAll()) { msgRef.current!.innerHTML = "⚠️ Vui lòng kiểm tra và sửa các trường bị lỗi."; return; }

    const full_name = (nameRef.current?.value || "").trim();
    const address = (addressRef.current?.value || "").trim();
    const city = (cityRef.current?.value || "").trim();
    const phone = (phoneRef.current?.value || "").trim();
    const email = (emailRef.current?.value || "").trim();
    const note = (noteRef.current?.value || "").trim();
    const shipping_address = `${address}, ${city}`.replace(/^,|,$/g, "").trim();

    setLoading(true);
    try {
      const items = listSP.map((sp) => ({ product_id: sp.id, quantity: sp.so_luong }));
      const body: any = {
        full_name, address: shipping_address, phone, email, note,
        order_code: orderCode, paymentMethod, items,
        total_client: totalClient,
        coupon: coupon ? { code: coupon.code, type: coupon.type, value: coupon.value } : undefined,
      };

      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { msgRef.current!.innerHTML = data?.message || "❌ Đặt hàng thất bại."; setLoading(false); return; }

      localStorage.setItem("last_checkout_email", email);
      try {
        sessionStorage.setItem("pending_order_code", orderCode);
        sessionStorage.setItem("pending_order_email", email);
        sessionStorage.setItem("pending_amount", String(amountInt));
      } catch { }

      // === Rẽ nhánh theo phương thức
      if (paymentMethod === "cod") {
        router.push("/thanh-toan/hoan-tat?payment=cod");
        return;
      }

      if (paymentMethod === "bank") {
      //   msgRef.current!.innerHTML = "✅ Đơn đã tạo. Vui lòng chuyển khoản theo VietQR bên dưới, rồi bấm 'Tôi đã chuyển khoản'.";
      //   // cuộn tới block bank
      //   setTimeout(() => bankBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      //   return;
      // }

      // if (paymentMethod === "vnpay") {
      //   // gọi VNPay và redirect
      //   const r = await fetch("/api/vnpay/create", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ order_code: orderCode, amount: amountInt }),
      //   });
      //   const j = await r.json();
      //   if (!r.ok || !j?.url) {
      //     msgRef.current!.innerHTML = j?.message || "Không tạo được .";
      //     setLoading(false);
      //     return;
      //   }
      //   window.location.href = j.url;
      //   return;
        router.push("/thanh-toan/hoan-tat?payment=bank");
        return;
      }

      if (paymentMethod === "stripe") {
        const stripeRes = await fetch("http://localhost:3000/api/stripe/create-checkout-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.id, cart: listSP,}),
        });
        const stripeData = await stripeRes.json();
        if (!stripeRes.ok) throw new Error(stripeData.message || "Kô thể tạo session thanh toán");
        window.location.href = stripeData.url; //Redirect Stripe
      }//if stripe  
  } catch (error: any) {
  console.error("Checkout error:", error);
  msgRef.current!.innerHTML = "❌ Lỗi kết nối: " + (error.message || "Không rõ nguyên nhân");
}
 finally {
  setLoading(false);
  }
    
  };

const inputCls = (hasErr: boolean, extra = "") =>
  `border p-2 rounded ${hasErr ? "border-red-500 focus:outline-red-500" : "border-gray-300"} ${extra}`;

return (
  <div className="max-w-[1300px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-8">
    {/* Banner yêu cầu đăng nhập */}
    {!authed && (
      <div className="lg:col-span-2 mb-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-[14px] text-amber-900">
        <b>Yêu cầu đăng nhập:</b> Bạn cần đăng nhập để tiếp tục thanh toán.
      </div>
    )}

    {/* Form bên trái */}
    <div className={authed ? "" : "opacity-60 pointer-events-none select-none"}>
      <h2 className="text-xl font-bold mb-4">THÔNG TIN THANH TOÁN</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <input
            ref={nameRef}
            type="text"
            placeholder="Họ & Tên *"
            className={inputCls(!!errName, "w-full")}
            onBlur={() => {
              const v = nameRef.current?.value || "";
              setErrName(isValidName(v) ? "" : "Vui lòng nhập Họ & Tên đầy đủ (ít nhất 2 từ).");
            }}
          />
          {errName && <p className="text-red-600 text-sm mt-1">{errName}</p>}
        </div>

        <div className="col-span-2">
          <input
            ref={addressRef}
            type="text"
            placeholder="Địa chỉ *"
            className={inputCls(!!errAddress, "w-full")}
            onBlur={() => {
              const v = addressRef.current?.value || "";
              setErrAddress(requireNonEmpty(v) ? "" : "Vui lòng nhập địa chỉ.");
            }}
          />
          {errAddress && <p className="text-red-600 text-sm mt-1">{errAddress}</p>}
        </div>

        <div className="col-span-2">
          <input
            ref={cityRef}
            type="text"
            placeholder="Thị trấn / Thành phố *"
            className={inputCls(!!errCity, "w-full")}
            onBlur={() => {
              const v = cityRef.current?.value || "";
              setErrCity(requireNonEmpty(v) ? "" : "Vui lòng nhập Thị trấn/Thành phố.");
            }}
          />
          {errCity && <p className="text-red-600 text-sm mt-1">{errCity}</p>}
        </div>

        <div>
          <input
            ref={phoneRef}
            type="text"
            placeholder="Số điện thoại *"
            className={inputCls(!!errPhone, "w-full")}
            onBlur={() => {
              const v = phoneRef.current?.value || "";
              setErrPhone(isValidPhoneVN(v) ? "" : "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).");
            }}
          />
          {errPhone && <p className="text-red-600 text-sm mt-1">{errPhone}</p>}
        </div>

        <div>
          <input
            ref={emailRef}
            type="email"
            placeholder="Địa chỉ email *"
            className={inputCls(!!errEmail, "w-full")}
            onBlur={() => {
              const v = emailRef.current?.value || "";
              setErrEmail(isValidEmail(v) ? "" : "Email không hợp lệ (VD: username@example.com).");
            }}
          />
          {errEmail && <p className="text-red-600 text-sm mt-1">{errEmail}</p>}
        </div>
      </div>

      <div className="mt-4">
        <textarea
          ref={noteRef}
          placeholder="Ghi chú đơn hàng (tuỳ chọn)"
          className="w-full border border-gray-300 p-2 rounded"
          rows={4}
        ></textarea>
      </div>

      <div ref={msgRef} className="text-red-600 font-semibold mt-4"></div>
    </div>

    {/* Đơn hàng bên phải */}
    <div className={"border rounded-lg p-6 shadow bg-white " + (authed ? "" : "opacity-60 pointer-events-none select-none")}>
      <h3 className="text-lg font-bold mb-4">ĐƠN HÀNG CỦA BẠN</h3>

      {/* Danh sách sản phẩm */}
      {listSP.map((sp) => {
        const unit = pickCartPrice(sp);
        const qty = sp.so_luong || 1;
        const line = unit * qty;
        const imgSrc = pickCartImage(sp);
        const name = pickCartName(sp);

        return (
          <div key={sp.id} className="grid grid-cols-[100px_1fr_100px] gap-4 border-b py-6 items-center">
            <img src={imgSrc} alt={name} className="w-24 h-24 object-contain border bg-white" />
            <div>
              <h3 className="text-base font-semibold text-gray-800">{name}</h3>
              <div className="flex flex-col my-1">
                <div className="flex items-center gap-2">
                  {toNum(sp?.gia_km ?? sp?.discount_price) > 0 &&
                    toNum(sp?.gia_km ?? sp?.discount_price) < toNum(sp?.gia_price ?? sp?.price) && (
                      <span className="text-sm line-through text-gray-400">
                        {toNum(sp?.gia_price ?? sp?.price).toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  <span className="text-sm text-gray-800">{unit.toLocaleString("vi-VN")}₫</span>
                </div>
                <span className="text-xs text-gray-500">• SL: {qty}</span>
              </div>
            </div>
            <div className="text-right font-semibold text-gray-800">{line.toLocaleString("vi-VN")}₫</div>
          </div>
        );
      })}

      {/* MÃ GIẢM GIÁ */}
      <div className="mt-4 border rounded p-3 bg-gray-50">
        <div className="font-semibold mb-2">Mã giảm giá</div>
        <div className="flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Nhập mã (VD: SALE10)"
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button type="button" onClick={applyCoupon} className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-black">
            Áp dụng
          </button>
        </div>
        {couponMsg && <div className={`mt-2 text-sm ${coupon ? "text-green-600" : "text-red-600"}`}>{couponMsg}</div>}
        {coupon && (
          <div className="mt-2 text-xs text-gray-600">
            Đã áp dụng mã <b>{coupon.code}</b> ({coupon.type === "percent" ? `-${coupon.value}%` : `-${coupon.value.toLocaleString("vi-VN")}₫`})
          </div>
        )}
      </div>

      {/* Tổng kết */}
      <div className="flex justify-between py-2 text-sm mt-3">
        <div>Tạm tính</div>
        <div>{subTotal.toLocaleString("vi-VN")}₫</div>
      </div>
      <div className="flex justify-between py-2 text-sm">
        <div>Giảm giá</div>
        <div>- {discountValue.toLocaleString("vi-VN")}₫</div>
      </div>
      <div className="flex justify-between py-2 text-sm">
        <div>Vận chuyển</div>
        <div>Free shipping</div>
      </div>
      <div className="flex justify-between font-bold py-2 border-t mt-2">
        <div>Tổng</div>
        <div>{totalClient.toLocaleString("vi-VN")}₫</div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="mt-4 space-y-2">
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
            className="mr-2"
          />
          Thanh toán khi nhận hàng (COD)
        </label>
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="stripe"
            checked={paymentMethod === "stripe"}
            onChange={() => setPaymentMethod("stripe")}
            className="mr-2"
          />
          Thanh toán với stripe (thẻ tín dụng, ATM nội địa)
        </label>
        <label className="block">
          <input
            type="radio"
            name="payment"
            value="bank"
            checked={paymentMethod === "bank"}
            onChange={() => setPaymentMethod("bank")}
            className="mr-2"
          />
          <span className="font-bold">Chuyển khoản ngân hàng (VietQR)</span>
        </label>

        {/* BLOCK VietQR hiển thị ngay trong trang khi chọn bank */}
        {/* {paymentMethod === "bank" && (
          <div ref={bankBoxRef} className="mt-2 bg-[#fdf6ed] border border-orange-400 rounded p-4 text-sm leading-relaxed text-gray-800">
            {!bankBin || !bankAcc ? (
              <div className="text-red-600">
                Thiếu cấu hình VietQR. Vui lòng thêm <code>NEXT_PUBLIC_VIETQR_BANK_BIN</code>,{" "}
                <code>NEXT_PUBLIC_VIETQR_ACCOUNT_NO</code>, <code>NEXT_PUBLIC_VIETQR_ACCOUNT_NAME</code> trong <b>.env.local</b>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                <div className="flex items-start justify-center">
                  {vietQrUrl ? (
                    <img src={vietQrUrl} alt="VietQR" className="w-[220px] h-[220px] border rounded bg-white" />
                  ) : (
                    <div className="w-[220px] h-[220px] border rounded flex items-center justify-center text-gray-500">
                      Không tạo được QR
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm space-y-2">
                    <div><div className="text-gray-500">Ngân hàng</div><div className="font-semibold">MB Bank</div></div>
                    <div>
                      <div className="text-gray-500">Số tài khoản</div>
                      <div className="font-semibold">{bankAcc}</div>
                      <button className="text-xs underline text-emerald-700 ml-1" onClick={() => copyToClipboard(bankAcc)}>Copy STK</button>
                    </div>
                    <div><div className="text-gray-500">Chủ tài khoản</div><div className="font-semibold">{bankName || "(chưa cấu hình)"}</div></div>
                    <div><div className="text-gray-500">Số tiền</div><div className="font-semibold">{amountInt.toLocaleString("vi-VN")}₫</div></div>
                    <div>
                      <div className="text-gray-500">Nội dung chuyển khoản</div>
                      <div className="font-semibold">{orderCode}</div>
                      <button className="text-xs underline text-emerald-700 ml-1" onClick={() => copyToClipboard(orderCode)}>Copy nội dung</button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 leading-snug">
                    Sau khi chuyển khoản thành công, hệ thống/nhân viên sẽ kiểm tra và xác nhận đơn hàng. Nếu cần hỗ trợ nhanh,
                    vui lòng gửi chứng từ chuyển khoản cho CSKH.
                  </p>
                </div>
              </div>
            )}
          </div>
        )} */}
      </div>

      <button
        onClick={submitCheckout}
        disabled={loading || !authed}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded mt-4 disabled:opacity-60"
      >
        {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
      </button>
    </div>
  </div>
);
}
