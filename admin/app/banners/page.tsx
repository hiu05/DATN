/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function BannerListPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) > 0 ? Number(searchParams.get("page")) : 1;
  const limit = 10; // số banner mỗi trang

  useEffect(() => {
    setLoading(true);
    fetch(`/api/banners?limit=${limit}&offset=${(page - 1) * limit}`)
      .then((res) => res.json())
      .then((data) => setBanners(data))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    setBanners(banners.filter((b) => b.id !== id));
  }

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
          Danh sách quảng cáo
        </h1>
        <Link
          href="/banners/create"
          className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          + Thêm quảng cáo
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
              <th className="p-3 border-b font-semibold text-center">ID</th>
              <th className="p-3 border-b font-semibold text-center">Ảnh</th>
              <th className="p-3 border-b font-semibold text-center">Ngày dùng</th>
              <th className="p-3 border-b font-semibold text-center">Hạn dùng</th>
              <th className="p-3 border-b font-semibold text-center">Trạng thái</th>
              <th className="p-3 border-b font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-b hover:bg-blue-50 transition-colors group">
                <td className="p-3 text-center font-medium">{b.id}</td>
                <td className="p-3 text-center">
                  <img
                    src={b.image_url}
                    alt="banner"
                    className="h-12 mx-auto rounded shadow-sm"
                  />
                </td>
                <td className="p-3 text-center">
                  {b.valid_from ? new Date(b.valid_from).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="p-3 text-center">
                  {b.valid_to ? new Date(b.valid_to).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="p-3 text-center">
                  {b.status ? (
                    <span className="inline-block text-green-600 text-lg">✅</span>
                  ) : (
                    <span className="inline-block text-red-400 text-lg">❌</span>
                  )}
                </td>
                <td className="p-3 text-center space-x-2">
                  <Link
                    href={`/banners/${b.id}/edit`}
                    className="text-blue-600 hover:underline font-semibold mx-2 transition-colors"
                  >
                    Sửa
                  </Link>
                  <span className="text-gray-400 mx-1">|</span>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 hover:underline font-semibold transition-colors"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Chưa có banner nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 gap-2">
        <Link
          href={`?page=${page - 1}`}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
            page <= 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : 0}
        >
          ← Trước
        </Link>
        <span className="px-4 py-2 font-bold text-blue-700 bg-blue-100 rounded-lg">
          Trang {page}
        </span>
        <Link
          href={`?page=${page + 1}`}
          className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150"
        >
          Sau →
        </Link>
      </div>
    </div>
  );
}
