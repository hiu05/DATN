"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Order = {
  id: number;
  order_code: string | null;
  order_date: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
};

export default function LichSuDonHang() {
  const sp = useSearchParams();
  const qEmail = sp.get("email") || "";
  const [email, setEmail] = useState(qEmail);
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchOrders = async (e: string) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(e)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Lỗi tải đơn hàng");
      setData(j.orders || []);
      if ((j.orders || []).length === 0) setMsg("Không tìm thấy đơn hàng nào.");
    } catch (err: any) {
      setMsg(err.message || "Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qEmail) fetchOrders(qEmail);
  }, [qEmail]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email đã đặt hàng"
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={() => fetchOrders(email)}
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
        >
          Tra cứu
        </button>
      </div>

      {loading && <div>Đang tải...</div>}
      {msg && <div className="text-gray-600">{msg}</div>}

      {data.length > 0 && (
        <div className="mt-4 border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Mã đơn</th>
                <th className="text-left p-2">Ngày đặt</th>
                <th className="text-left p-2">Trạng thái</th>
                <th className="text-right p-2">Tổng tiền</th>
                <th className="text-left p-2">Thanh toán</th>
                <th className="text-left p-2">Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 font-medium">{o.order_code || `#${o.id}`}</td>
                  <td className="p-2">{new Date(o.order_date).toLocaleString()}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2 text-right">{Number(o.total_amount).toLocaleString()} ₫</td>
                  <td className="p-2">{o.payment_method}</td>
                  <td className="p-2">{o.shipping_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}  