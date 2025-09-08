/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<any>({
    code: "",
    discount_percent: 0,
    valid_from: "",
    valid_to: "",
    usage_limit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/coupons/${id}`);
      if (!res.ok) { alert("Không tìm thấy mã"); router.push("/coupons"); return; }
      const data = await res.json();
      const toDate = (v: string | null) => (v ? v.slice(0, 10) : "");
      setForm({
        code: data.code ?? "",
        discount_percent: data.discount_percent ?? 0,
        valid_from: toDate(data.valid_from ?? null),
        valid_to: toDate(data.valid_to ?? null),
        usage_limit: data.usage_limit ?? 0,
      });
      setLoading(false);
    })();
  }, [id, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { alert("Cập nhật thất bại"); return; }
    alert("Đã cập nhật");
    router.push("/coupons");
  }

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Sửa mã #{id}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Mã</label>
          <input
            className="w-full border rounded-lg p-2"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Giảm (%)</label>
          <input
            type="number" min={0} max={100}
            className="w-full border rounded-lg p-2"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Ngày hết hạn</label>
            <input
              type="date"
              className="w-full border rounded-lg p-2"
              value={form.valid_to}
              onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Giới hạn (0 = không giới hạn)</label>
          <input
            type="number" min={0}
            className="w-full border rounded-lg p-2"
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="px-5 py-2 rounded-lg bg-gray-200 font-semibold hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
