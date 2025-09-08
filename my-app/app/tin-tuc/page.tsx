/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

type Tin = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  created_at: string;
};

type ApiResp =
  | { items: Tin[]; total: number; page: number; pageSize: number }
  | Tin[];

export default function TrangTinTuc() {
  const [list, setList] = useState<Tin[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await axios.get<ApiResp>(`${apiBase}/api/tin-tuc`, {
          params: { page, pageSize },
        });
        if (Array.isArray(res.data)) {
          setList(res.data);
          setTotal(res.data.length);
        } else {
          setList(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      } catch (e: any) {
        console.error('Lỗi khi tải tin tức:', e);
        setErr("Không tải được tin tức. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [apiBase, page]);

  const goto = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tạo dải trang ngắn gọn: 1 … (page-1) page (page+1) … total
  const buildPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <main className="min-h-[100vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white">
      {/* decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* breadcrumb */}
        <div className="text-sm text-slate-500 mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Trang chủ</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-700">Tin tức</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold uppercase text-orange-500">Tin tức</h1>
          <p className="text-slate-600 mt-2">Cập nhật thông tin, bài viết và mẹo hay mỗi tuần</p>
        </div>

        {/* content */}
        {loading ? (
          <SkeletonGrid />
        ) : err ? (
          <div className="mx-auto max-w-lg rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 p-4 text-sm text-center">
            {err}
          </div>
        ) : list.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-xl bg-white ring-1 ring-slate-200 p-6 text-center text-slate-600">
            Chưa có bài viết.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 hover:shadow-xl transition"
                >
                  <Link href={`/tin-tuc/${item.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image_url || '/no-image.png'}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
                      />
                      <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-orange-600 transition">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                        {item.excerpt || ''}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:shadow-md transition">
                          Đọc thêm
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goto(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>

                {buildPages().map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-2 text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goto(p)}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        p === page
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => goto(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

/** Skeleton grid khi loading */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-40 w-full animate-pulse bg-slate-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-24 animate-pulse rounded bg-slate-100 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
