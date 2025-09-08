"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBanner() {
  const [form, setForm] = useState({
    image_url: "",
    valid_from: "",
    valid_to: "",
    status: true,
  });
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/banners");
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Thêm Banner</h1>
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
          value={form.valid_from}
          onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={form.valid_to}
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
          Lưu
        </button>
      </form>
    </div>
  );
}
