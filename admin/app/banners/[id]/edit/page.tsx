/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditBanner() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/banners/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/banners");
  }

  if (!form) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Sửa Banner</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Image URL"
          className="w-full p-2 border rounded"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={form.valid_from?.slice(0, 10) || ""}
          onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={form.valid_to?.slice(0, 10) || ""}
          onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.checked })}
          />
          Hiển thị
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Cập nhật
        </button>
      </form>
    </div>
  );
}
