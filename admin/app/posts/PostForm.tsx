"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UploadImage from "@/app/component/UploadImage";
import { IPost } from "@/app/lib/cautrucdata";
import { toSlug } from "@/app/lib/aboutstring";

export default function PostForm({
  initial = {},
  mode = "create", // "create" | "edit"
}: {
  initial?: IPost;
  mode?: "create" | "edit";
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.title ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [imageUrl, setImageUrl] = useState(initial.image_url ?? "");
  const [content, setContent] = useState(initial.content ?? "");
  const [userId, setUserId] = useState(
    typeof initial.user_id === "number" ? String(initial.user_id) : ""
  );
  const [isPublished, setIsPublished] = useState<0 | 1>(
    (typeof initial.is_published === "boolean"
      ? (initial.is_published ? 1 : 0)
      : (initial.is_published ?? 0)) as 0 | 1
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-slug theo title (chỉ khi đang thêm hoặc slug đang trống)
  useEffect(() => {
    if (mode === "create" || !initial.slug) setSlug(toSlug(title));
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  const validMsg = useMemo(() => {
    if (!title.trim()) return "Vui lòng nhập tiêu đề";
    if (!slug.trim()) return "Vui lòng nhập slug";
    if (!userId.trim() || Number(userId) <= 0) return "Vui lòng nhập User ID hợp lệ";
    return "";
  }, [title, slug, userId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validMsg;
    if (msg) return setError(msg);
    setError("");
    setSaving(true);

    try {
      const body = {
        title,
        slug,
        excerpt,
        image_url: imageUrl || null,
        content,
        is_published: isPublished ? 1 : 0,
        user_id: Number(userId),
      };

      const res = await fetch(
        mode === "edit" ? `/api/posts/${initial.slug}` : `/api/posts`,
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Lưu bài viết thất bại");
      }

      router.push("/posts");
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block font-semibold mb-1">Tiêu đề</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="vd: bai-viet-moi"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tóm tắt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Ảnh bài viết</label>
        <UploadImage
          value={imageUrl}
          onChange={setImageUrl}
          className="w-full"
          placeholder="Chọn ảnh đại diện cho bài viết"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">User ID</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!isPublished}
          onChange={(e) => setIsPublished(e.target.checked ? 1 : 0)}
        />
        <span>Xuất bản ngay</span>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
      >
        {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Lưu bài viết"}
      </button>
    </form>
  );
}
