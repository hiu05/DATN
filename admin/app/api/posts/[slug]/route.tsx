import { NextResponse } from "next/server";
import { PostModel } from "@/app/lib/models";
import { IPost } from "@/app/lib/cautrucdata";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const post = await PostModel.findOne({
    where: { slug: params.slug },
    attributes: ["id", "title", "slug", "excerpt", "image_url", "content", "user_id", "is_published"],
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  // 1) Tìm bài viết theo slug
  const existing = await PostModel.findOne({
    where: { slug },
    attributes: ["id", "slug"],
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) Chuẩn bị dữ liệu cập nhật
  const data: Partial<IPost> = {
    title: body.title,
    slug: body.slug ?? existing.slug, // có thể đổi slug mới
    excerpt: body.excerpt,
    image_url: body.image_url || null,
    content: body.content,
    is_published: body.is_published ? 1 : 0,
    updated_at: new Date(),
    user_id: Number(body.user_id),
  };
  
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  // 3) Cập nhật theo slug
  await PostModel.update(data, { where: { id: existing.id } });

  // 4) Trả dữ liệu mới
  const updatedPost = await PostModel.findByPk(existing.id);
  return NextResponse.json(updatedPost);
}


export async function DELETE(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  // 1) Tìm bài viết theo slug
  const post = await PostModel.findOne({ where: { slug } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) Xoá bài viết
  await PostModel.destroy({ where: { id: post.id } });

  // 3) Trả kết quả thành công
  return NextResponse.json({ message: "Post deleted successfully" });
}