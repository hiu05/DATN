"use client";

import PostForm from "../PostForm";

export default function ThemPostPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">+ Thêm bài viết</h1>
      <PostForm mode="create" />
    </div>
  );
}
