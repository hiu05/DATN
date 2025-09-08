"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoupon() {
  const [form, setForm] = useState({
    code: "",
    discount_percent: 0,
    valid_from: "",
    valid_to: "",
    usage_limit: "",
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/coupons");
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Thêm mã giảm giá</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Mã code" className="w-full p-2 border rounded"
          value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />

        <input type="number" placeholder="Giảm (%)" className="w-full p-2 border rounded"
          value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} />

        <input type="date" className="w-full p-2 border rounded"
          value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />

        <input type="date" className="w-full p-2 border rounded"
          value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />

        <input type="number" placeholder="Giới hạn" className="w-full p-2 border rounded"
          value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Lưu
        </button>
      </form>
    </div>
  );
}
