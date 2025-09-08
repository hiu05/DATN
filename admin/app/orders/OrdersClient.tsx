"use client";

import { Fragment, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: { id: number; name: string; slug?: string };
};

type Order = {
  id: number;
  receiver_name?: string;
  receiver_phone?: string;
  order_date?: string;
  status?: string;
  total_amount?: number;
  payment_method?: string;
  shipping_address?: string;
  coupon?: { id: number; code: string } | null;
  items?: OrderItem[];
};

export default function OrdersClient({
  initialOrders,
  page,
  limit,
}: {
  initialOrders: Order[];
  page: number;
  limit: number;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [openId, setOpenId] = useState<number | null>(null);

  const fmtMoney = (n: any) =>
    Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " đ";

  const statusPill = (s?: string) => {
    const map: Record<string, string> = {
      "Chờ xác nhận": "bg-amber-100 text-amber-700",
      "Đang xử lý": "bg-blue-100 text-blue-700",
      "Đang giao": "bg-cyan-100 text-cyan-700",
      "Đã giao": "bg-emerald-100 text-emerald-700",
      "Đã hủy": "bg-rose-100 text-rose-700",
    };
    const cls = map[s || ""] || "bg-slate-100 text-slate-700";
    return <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${cls}`}>{s || "—"}</span>;
  };

  return (
    <>
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
                    Danh sách Đơn hàng
                </h1>
                <Link href="/orders/them" className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    + Thêm Đơn hàng
                </Link>
            </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
              <th className="p-3 border-b font-semibold text-center w-10"></th>
              <th className="p-3 border-b font-semibold text-center">ID</th>
              <th className="p-3 border-b font-semibold text-left">Người nhận</th>
              <th className="p-3 border-b font-semibold text-left">Điện thoại</th>
              <th className="p-3 border-b font-semibold text-left">Ngày</th>
              <th className="p-3 border-b font-semibold text-center">Trạng thái</th>
              <th className="p-3 border-b font-semibold text-right">Tổng tiền</th>
              <th className="p-3 border-b font-semibold text-left">Phương thức</th>
              <th className="p-3 border-b font-semibold text-left">Mã giảm giá</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const opened = openId === o.id;
                const dateStr = o.order_date ? new Date(o.order_date).toLocaleString("vi-VN") : "—";
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b hover:bg-blue-50 transition-colors group">
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setOpenId(opened ? null : o.id)}
                          className="w-6 h-6 rounded border hover:bg-white bg-gray-100"
                          title={opened ? "Thu gọn" : "Xem chi tiết"}
                        >
                          {opened ? "−" : "+"}
                        </button>
                      </td>
                      <td className="p-3 text-center font-medium">{o.id}</td>
                      <td className="p-3 font-semibold">{o.receiver_name || "—"}</td>
                      <td className="p-3">{o.receiver_phone || "—"}</td>
                      <td className="p-3">{dateStr}</td>
                      <td className="p-3 text-center">{statusPill(o.status)}</td>
                      <td className="p-3 text-right font-bold text-blue-700">{fmtMoney(o.total_amount)}</td>
                      <td className="p-3">{o.payment_method || "—"}</td>
                      <td className="p-3">{o.coupon?.code || "—"}</td>
                
                    </tr>

                    {/* Hàng mở rộng: sản phẩm trong đơn */}
                    {opened && (
                      <tr className="bg-white">
                        <td colSpan={10} className="p-0">
                          <div className="px-4 py-3">
                            <div className="rounded-xl border">
                              <div className="p-3 border-b flex items-center justify-between">
                                <div className="font-semibold text-blue-700">Sản phẩm trong đơn #{o.id}</div>
                                <div className="text-xs text-slate-500">
                                  Địa chỉ: {o.shipping_address || "—"}
                                </div>
                              </div>
                              <div className="overflow-auto">
                                <table className="min-w-full text-sm">
                                  <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                      <th className="p-2 border text-left">Sản phẩm</th>
                                      <th className="p-2 border text-right w-24">Số lượng</th>
                                      <th className="p-2 border text-right w-36">Đơn giá</th>
                                      <th className="p-2 border text-right w-36">Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(o.items || []).map((it) => {
                                      const qty = Number(it.quantity || 0);
                                      const price = Number(it.unit_price || 0);
                                      const sub = qty * price;
                                      return (
                                        <tr key={it.id} className="border-b">
                                          <td className="p-2 border">
                                            {it.product?.name || `#${it.product_id}`}
                                          </td>
                                          <td className="p-2 border text-right">{qty}</td>
                                          <td className="p-2 border text-right">{fmtMoney(price)}</td>
                                          <td className="p-2 border text-right font-medium">{fmtMoney(sub)}</td>
                                        </tr>
                                      );
                                    })}
                                    {(o.items || []).length === 0 && (
                                      <tr>
                                        <td colSpan={4} className="p-3 text-center text-slate-500">
                                          Đơn này chưa có dòng sản phẩm.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Phân trang */}
      <div className="flex justify-center mt-10 gap-2">
        <Link
          href={`?page=${page - 1}`}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
            page <= 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : 0}
        >
          ← Trước
        </Link>
        <span className="px-4 py-2 font-bold text-blue-700 bg-blue-100 rounded-lg">Trang {page}</span>
        <Link
          href={`?page=${page + 1}`}
          className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150"
        >
          Sau →
        </Link>
      </div>
    </>
  );
}
