"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { xoaGH } from "@/lib/cartSlice";

type OrderItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  image_url?: string;
};

export default function HoanTatThanhToan() {
  const dispatch = useDispatch();
  const [orderCode, setOrderCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(""); // thêm
  const [loaded, setLoaded] = useState(false);
  const msgRef = useRef<HTMLDivElement>(null);
  const paymentM = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment")) || "";
  useEffect(() => {
    // 1) Clear giỏ hàng
    dispatch(xoaGH());
    try {
      localStorage.removeItem("tw_cart_v1");
      localStorage.removeItem("cart");
      localStorage.removeItem("cartItems");
      localStorage.removeItem("gio_hang");
    } catch {}

    // 2) Lấy thông tin đơn pending từ sessionStorage
    try {
      const code = sessionStorage.getItem("pending_order_code") || "";
      const em =
        sessionStorage.getItem("pending_order_email") ||
        localStorage.getItem("last_checkout_email") ||
        "";
      setOrderCode(code);
      setEmail(em);

      // 3) Gọi API lấy tóm tắt đơn
      (async () => {
        try {
          let summary: any = null;

          if (code) {
            const r1 = await fetch(`/api/orders/${encodeURIComponent(code)}`);
            if (r1.ok) summary = await r1.json();
          }
          console.log("summary", summary);
          
          if (summary) {
            if (summary?.items?.length) {
              setItems(
                summary.items.map((it: any) => ({
                  id: it.product_id ?? it.id,
                  name: it.name ?? it.ten_sp ?? `Sản phẩm #${it.product_id ?? it.id}`,
                  qty: it.quantity ?? it.qty ?? 1,
                  price: Number(it.unit_price ?? it.price ?? 0),
                  image_url: it.image_url,
                }))
              );
            }
            setTotal(Number(summary.orders[0].total_amount ?? summary.total ?? 0));
            setPaymentMethod(summary.payment_method ?? "");
          }

          // đổi trạng thái đơn thành "Đang xử lý"
          if (paymentM === "stripe" || paymentM === "cod") {
            await fetch(`/api/orders/${encodeURIComponent(code)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ payment_method: paymentM }), 
            });
          }

        } catch {
          // bỏ qua lỗi
        } finally {
          setLoaded(true);
        }
      })();
    } catch {
      setLoaded(true);
    }
  }, [dispatch]);
  
  // QR VietQR (nếu thanh toán chuyển khoản)
  const bankBin = process.env.NEXT_PUBLIC_VIETQR_BANK_BIN || "";   // ví dụ: 970436
  const bankAcc = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || "";  // số TK
  const bankName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || ""; // chủ TK
  
  const amountInt = useMemo(() => Math.max(0, Math.floor(total)), [total]);
  console.log("amountInt", amountInt);
  
  const vietQrUrl = useMemo(() => {
    if (!bankBin || !bankAcc) return "";
    const info = encodeURIComponent(orderCode || "Thanh toan don hang");
    return `https://img.vietqr.io/image/${bankBin}-${bankAcc}-qr_only.png?amount=${amountInt}&addInfo=${info}`;
  }, [bankBin, bankAcc, amountInt, orderCode]);

  const copyToClipboard = async (t: string) => {
    try { await navigator.clipboard.writeText(t); msgRef.current!.innerHTML = "Đã copy!"; setTimeout(() => { if (msgRef.current) msgRef.current.innerHTML = ""; }, 1200); }
    catch { msgRef.current!.innerHTML = "Không thể copy."; }
  };
  
  
  if (paymentM === "stripe-cancel") {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-12">
        <div className="bg-white border rounded-xl p-8 shadow text-center">
          <h1 className="text-2xl font-bold text-red-600">❌ Thanh toán không thành công</h1>
          <p className="mt-2 text-gray-700">
            Quá trình thanh toán qua Stripe đã bị hủy hoặc không thành công.
            Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
          <div ref={msgRef} className="text-red-600 font-semibold mt-3"></div>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/thanh-toan"
              className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              Quay lại thanh toán
            </Link>
            <Link
              href="/"
              className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-50 font-semibold"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <div className="bg-white border rounded-xl p-8 shadow">
        <h1 className="text-2xl font-bold text-green-600">🎉 Đặt hàng thành công!</h1>
        <p className="mt-2 text-gray-700">
          Cảm ơn bạn đã mua sắm tại <b>TimeWatch</b>.
          {orderCode && <> Mã đơn hàng của bạn là <b>{orderCode}</b>.</>}
        </p>
        {email && (
          <p className="text-gray-600">
            Xác nhận đơn đã gửi tới email: <b>{email}</b>
          </p>
        )}

        {/* Tóm tắt đơn */}
        {loaded && items.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-3">Tóm tắt đơn hàng</h2>
            <div className="divide-y">
              {items.map((it) => (
                <div key={it.id} className="py-3 flex items-center gap-4">
                  {it.image_url && (
                    <img
                      src={it.image_url}
                      alt={it.name}
                      className="w-14 h-14 object-contain border bg-white"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-600">SL: {it.qty}</div>
                  </div>
                  <div className="font-semibold">
                    {(it.price * it.qty).toLocaleString("vi-VN")}₫
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 border-t pt-3 font-bold">
              <span>Tổng cộng</span>
              <span>{total > 0 ? total.toLocaleString("vi-VN") + "₫" : "-"}</span>
            </div>
          </div>
        )}

        {/* QR khi chọn chuyển khoản */}
        {vietQrUrl && paymentM==="bank" && (
          <div className="mt-8 p-5 border rounded-lg bg-gray-50 text-center">
            <h3 className="font-semibold text-lg mb-3">Chuyển khoản ngân hàng</h3>
            <p className="text-sm text-gray-600 mb-3">
              Vui lòng quét mã QR bên dưới và chuyển chính xác số tiền{" "}
              <b>{total.toLocaleString("vi-VN")}₫</b> với nội dung <b>{orderCode}</b>
            </p>
            <img
              src={vietQrUrl}
              alt="QR Thanh toán"
              className="mx-auto w-60 h-60 object-contain"
            />
          </div>
        )}

        <div ref={msgRef} className="text-red-600 font-semibold mt-3"></div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            Về trang chủ
          </Link>
          <Link
            href="/don-hang"
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-50 font-semibold"
          >
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
