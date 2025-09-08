"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// ... types giữ nguyên

export default function OrderForm({ users, products, initial = {}, mode = "create" }: {
  users: UserLite[]; products: ProductLite[]; initial?: OrderInit; mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [userId, setUserId] = useState<number | "">(initial.user_id ?? "");
  const [receiverName, setReceiverName] = useState(initial.receiver_name || "");
  const [receiverPhone, setReceiverPhone] = useState(initial.receiver_phone || "");
  const [shippingAddress, setShippingAddress] = useState(initial.shipping_address || "");
  const [paymentMethod, setPaymentMethod] = useState(initial.payment_method || "COD");
  const [status, setStatus] = useState<OrderInit["status"]>(initial.status || "Chờ xác nhận");
  const [couponId, setCouponId] = useState<number | "">(initial.coupon_id ?? "");
  const [note, setNote] = useState(initial.note || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ fix default items
  const mapped = (initial.items || []).map(i => ({
    product_id: i.product_id, quantity: i.quantity, unit_price: Number(i.unit_price),
  }));
  const [items, setItems] = useState<{ product_id: number | ""; quantity: number | ""; unit_price: number | "" }[]>(
    mapped.length > 0 ? mapped : [{ product_id: "", quantity: "", unit_price: "" }]
  );

  const productMap = useMemo(() => {
    const m = new Map<number, ProductLite>();
    products.forEach(p => m.set(p.id, p));
    return m;
  }, [products]);

  const total = useMemo(() => items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0), [items]);

  function setItem(idx: number, patch: Partial<{ product_id: number | ""; quantity: number | ""; unit_price: number | "" }>) {
    setItems(prev => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function addRow() { setItems(prev => [...prev, { product_id: "", quantity: "", unit_price: "" }]); }
  function removeRow(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }

  // ✅ auto fill khi chọn user
  function handleSelectUser(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setUserId(val);
    if (val !== "") {
      const u = users.find(x => x.id === val);
      if (u) {
        if (!receiverName) setReceiverName(u.full_name || "");
        if (!receiverPhone) setReceiverPhone(u.phone || "");
      }
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const normalized = items
      .filter(r => r.product_id !== "" && r.quantity !== "" && r.unit_price !== "")
      .map(r => ({ product_id: Number(r.product_id), quantity: Number(r.quantity), unit_price: Number(r.unit_price) }));

    if (normalized.length === 0) return setError("Vui lòng điền đủ sản phẩm / số lượng / đơn giá");

    const body = {
      user_id: userId === "" ? null : Number(userId),
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      status,
      note,
      coupon_id: couponId === "" ? null : Number(couponId),
      items: normalized,
      total_amount: total, // ✅ gửi tổng
    };

    try {
      setSaving(true);
      const res = await fetch(mode === "edit" ? `/api/orders/${initial.id}` : `/api/orders`, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Không thể lưu đơn hàng");
      }
      router.push("/orders");
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{mode === "edit" ? "Sửa đơn hàng" : "Tạo đơn hàng"}</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded">Hủy</button>
          <button type="submit" disabled={saving} className={`px-5 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <section className="space-y-4">
          <Field label="Khách hàng (tùy chọn)">
            <select
              className="w-full border rounded px-3 py-2"
              value={userId === "" ? "" : String(userId)}
              onChange={(e)=> setUserId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">— Khách lẻ —</option>
              {users.map(u => (
                <option key={u.id} value={String(u.id)}>
                  {u.full_name || u.email || `User #${u.id}`}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tên người nhận">
            <input className="w-full border rounded px-3 py-2" value={receiverName} onChange={(e)=>setReceiverName(e.target.value)} />
          </Field>
          <Field label="Điện thoại">
            <input className="w-full border rounded px-3 py-2" value={receiverPhone} onChange={(e)=>setReceiverPhone(e.target.value)} />
          </Field>
          <Field label="Địa chỉ giao hàng">
            <input className="w-full border rounded px-3 py-2" value={shippingAddress} onChange={(e)=>setShippingAddress(e.target.value)} />
          </Field>
        </section>

        {/* Cột phải */}
        <section className="space-y-4">
          <Field label="Phương thức thanh toán">
            <select className="w-full border rounded px-3 py-2" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
              <option value="COD">COD</option>
              <option value="Bank">Chuyển khoản</option>
              <option value="VNPAY">VNPAY</option>
            </select>
          </Field>
          <Field label="Trạng thái">
            <select className="w-full border rounded px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
              <option>Chờ xác nhận</option>
              <option>Đang xử lý</option>
              <option>Đang giao</option>
              <option>Đã giao</option>
              <option>Đã hủy</option>
            </select>
          </Field>
          <Field label="Mã giảm giá (ID - tùy chọn)">
            <input className="w-full border rounded px-3 py-2" value={couponId === "" ? "" : String(couponId)} onChange={(e)=>setCouponId(e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <Field label="Ghi chú">
            <textarea className="w-full border rounded px-3 py-2 min-h-[90px]" value={note} onChange={(e)=>setNote(e.target.value)} />
          </Field>
        </section>
      </div>

      {/* Items */}
      <section className="rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-700">Sản phẩm</h3>
          <button type="button" onClick={addRow} className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">+ Thêm dòng</button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border">Sản phẩm</th>
                <th className="p-2 border w-28">Số lượng</th>
                <th className="p-2 border w-36">Đơn giá</th>
                <th className="p-2 border w-36">Thành tiền</th>
                <th className="p-2 border w-16">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => {
                const unit = Number(row.unit_price || 0);
                const qty = Number(row.quantity || 0);
                const subtotal = qty * unit;
                return (
                  <tr key={i} className="border-b">
                    <td className="p-2 border">
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={row.product_id === "" ? "" : String(row.product_id)}
                        onChange={(e)=>{
                          const pid = e.target.value === "" ? "" : Number(e.target.value);
                          setItem(i, { product_id: pid });
                          if (pid !== "") {
                            const p = productMap.get(pid as number);
                            if (p?.price) setItem(i, { unit_price: Number(p.price) });
                          }
                        }}
                      >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => (
                          <option key={p.id} value={String(p.id)}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">
                      <input type="number" min={1} className="w-full border rounded px-2 py-1 text-right"
                        value={row.quantity} onChange={(e)=> setItem(i, { quantity: Number(e.target.value) })} />
                    </td>
                    <td className="p-2 border">
                      <input type="number" min={0} className="w-full border rounded px-2 py-1 text-right"
                        value={row.unit_price} onChange={(e)=> setItem(i, { unit_price: Number(e.target.value) })} />
                    </td>
                    <td className="p-2 border text-right font-medium">
                      {subtotal.toLocaleString("vi-VN")}
                    </td>
                    <td className="p-2 border text-center">
                      <button type="button" onClick={()=>removeRow(i)} className="px-2 py-1 rounded border">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="p-2 border text-right font-semibold">Tổng:</td>
                <td className="p-2 border text-right font-bold">{total.toLocaleString("vi-VN")} đ</td>
                <td className="p-2 border" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
