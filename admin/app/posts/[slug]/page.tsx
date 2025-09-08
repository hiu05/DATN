import { headers } from "next/headers";
import PostForm from "../PostForm";
import { IPost as PostInit } from "@/app/lib/cautrucdata";

// Next 15+: params là Promise, nhớ await
export default async function EditPostPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // build base URL an toàn cho dev/prod
  const h = await headers();
  const host = h.get("host")!;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = process.env.APP_URL || `${proto}://${host}`;

  const res = await fetch(`${base}/api/posts/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <div className="p-8 text-red-600">
        Không tải được bài viết #{slug}.
      </div>
    );
  }

  const post: PostInit = await res.json();

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Sửa bài viết </h1>
      <PostForm mode="edit" initial={post} />
    </div>
  );
}
