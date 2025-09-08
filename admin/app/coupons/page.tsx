/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CouponListPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/coupons?limit=${limit}&offset=${(page - 1) * limit}`)
      .then((res) => res.json())
      .then((data) => setCoupons(data))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xóa mã này?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    setCoupons(coupons.filter((c) => c.id !== id));
  }

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
          Danh sách mã giảm giá
        </h1>
        <Link
          href="/coupons/create"
          className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md"
        >
          + Thêm mã
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
              <th className="p-3 border-b text-center">ID</th>
              <th className="p-3 border-b text-center">Mã</th>
              <th className="p-3 border-b text-center">Giảm (%)</th>
              <th className="p-3 border-b text-center">Ngày bắt đầu</th>
              <th className="p-3 border-b text-center">Ngày hết hạn</th>
              <th className="p-3 border-b text-center">Giới hạn</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b hover:bg-blue-50 transition-colors">
                <td className="p-3 text-center font-medium">{c.id}</td>
                <td className="p-3 text-center font-bold">{c.code}</td>
                <td className="p-3 text-center">{c.discount_percent}%</td>
                <td className="p-3 text-center">{c.valid_from ?? "-"}</td>
                <td className="p-3 text-center">{c.valid_to ?? "-"}</td>
                <td className="p-3 text-center">{c.usage_limit ?? "-"}</td>
                <td className="p-3 text-center space-x-2">
                  <Link
                    href={`/coupons/${c.id}/edit`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sửa
                  </Link>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
            page <= 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          ← Trước
        </button>
        <span className="px-4 py-2 font-bold text-blue-700 bg-blue-100 rounded-lg">
          Trang {page}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
