/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CommentListPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetch(`/api/comments?limit=${limit}&offset=${(page - 1) * limit}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id: number) {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    setComments(comments.filter((c) => c.id !== id));
  }

  if (loading) return <p className="p-6">Đang tải...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
          Danh sách bình luận
        </h1>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
              <th className="p-3 border-b font-semibold text-center">ID</th>
              <th className="p-3 border-b font-semibold text-center">Người dùng</th>
              <th className="p-3 border-b font-semibold text-center">Sản phẩm</th>
              <th className="p-3 border-b font-semibold text-center">Số sao</th>
              <th className="p-3 border-b font-semibold text-left">Nội dung</th>
              <th className="p-3 border-b font-semibold text-center">Ngày tạo</th>
              <th className="p-3 border-b font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c.id} className="border-b hover:bg-blue-50 transition-colors group">
                <td className="p-3 text-center font-medium">{c.id}</td>
                <td className="p-3 text-center">{c.user_id}</td>
                <td className="p-3 text-center">{c.product_id}</td>
                <td className="p-3 text-center font-bold text-yellow-600">
                  {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
                </td>
                <td className="p-3">{c.comment}</td>
                <td className="p-3 text-center">
                  {c.created_at ? new Date(c.created_at).toLocaleString() : "-"}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline font-semibold transition-colors"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Chưa có bình luận nào
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
          className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
