// app/posts/page.tsx
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import NutXoaPost from "./NutXoaPost";
export const dynamic = "force-dynamic";
import { IPost } from "../lib/cautrucdata";

function getBaseURL() {
    const h = headers();
    const host = h.get("host")!;
    const proto = process.env.VERCEL ? "https" : "http";
    return process.env.APP_URL || `${proto}://${host}`;
}

export default async function PostList({
    searchParams,
}: {
    searchParams?: { page?: string };
}) {
    const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const res = await fetch(
        `${getBaseURL()}/api/posts?limit=${limit}&offset=${offset}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        const text = await res.text();
        console.error("GET /api/posts failed:", res.status, text.slice(0, 200));
        return (
            <div className="max-w-5xl mx-auto p-8">
                <p className="text-red-600">Không tải được danh sách bài viết.</p>
            </div>
        );
    }

    const post_arr: IPost[] = await res.json();
    console.log("🚀 Danh sách bài viết:", post_arr);

    return (
        <div className="max-w-5xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
                    Danh sách bài viết
                </h1>
                <Link
                    href="/posts/them"
                    className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    + Thêm bài viết
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
                <table className="min-w-full text-sm text-gray-700">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
                            <th className="p-3 border-b font-semibold text-center">ID</th>
                            <th className="p-3 border-b font-semibold text-left">Tiêu đề</th>
                            <th className="p-3 border-b font-semibold text-left">Ảnh</th>
                            <th className="p-3 border-b font-semibold text-left">Tác giả</th>
                            <th className="p-3 border-b font-semibold text-left">Ngày tạo</th>
                            <th className="p-3 border-b font-semibold text-left">Cập nhật</th>
                            <th className="p-3 border-b font-semibold text-center">Xuất bản</th>
                            <th className="p-3 border-b font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {post_arr.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b hover:bg-blue-50 transition-colors group"
                            >
                                <td className="p-3 text-center font-medium">{p.id}</td>
                                <td className="p-3 font-semibold line-clamp-2">{p.title}</td>
                                <td className="p-3 text-center">
                                    {p.image_url ? (
                                        <Image
                                            src={p.image_url}
                                            alt={p.title}
                                            width={60}
                                            height={60}
                                            className="rounded border bg-white inline-block"
                                        // nếu bạn chưa cấu hình domain cho next/image, bỏ comment dòng dưới:
                                        // unoptimized
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic">Không ảnh</span>
                                    )}
                                </td>
                                <td className="p-3 font-mono">{p.user?.full_name || "—"}</td>
                                <td className="p-3">
                                    {p.created_at
                                        ? new Date(p.created_at).toLocaleString("vi-VN")
                                        : "—"}
                                </td>
                                <td className="p-3">
                                    {p.updated_at
                                        ? new Date(p.updated_at).toLocaleString("vi-VN")
                                        : "—"}
                                </td>
                                <td className="p-3 text-center">
                                    {p.is_published ? (
                                        <span className="inline-block text-green-600 text-lg">
                                            ✅
                                        </span>
                                    ) : (
                                        <span className="inline-block text-red-400 text-lg">
                                            ❌
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <Link
                                        href={`/posts/${p.slug}`}
                                        className="text-blue-600 hover:underline font-semibold mx-2 transition-colors"
                                    >
                                        Sửa
                                    </Link>
                                    <span className="text-gray-400 mx-1">|</span>
                                    <NutXoaPost slug={p.slug} />
                                </td>
                            </tr>
                        ))}
                        {post_arr.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="p-6 text-center text-gray-500 italic"
                                >
                                    Chưa có bài viết nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


                {/* Pagination */}
                < div className="flex justify-center mt-10 gap-2" >
                    <Link
                        href={`?page=${page - 1}`}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${page <= 1
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
        </div>
    );
}
