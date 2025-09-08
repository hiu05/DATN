"use client";

export default function NutXoaPost({ slug }: { slug: string }) {
  async function handleDelete() {
    if (!confirm("Xoá bài viết này?")) return;
    const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
    console.log("Xoá bài viết", slug, res);
    
    if (res.ok) location.reload();
    else alert("Không xoá được bài viết");
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline font-semibold">
      Xoá
    </button>
  );
}
