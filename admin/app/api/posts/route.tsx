import { NextResponse } from "next/server";
import { UserModel } from "@/app/lib/models";
import { PostModel } from "@/app/lib/models";
import { toSlug } from "@/app/lib/aboutstring";

async function makeUniqueSlug(base: string) {
  let slug = base || "post";
  let i = 1;
  // lặp đến khi không còn trùng
  while (await PostModel.findOne({ where: { slug } })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit  = Number(searchParams.get("limit"))  || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  const rows = await PostModel.findAll({
    order: [["id", "desc"]],
    limit,
    offset,
    attributes: [
      "id","title","slug","excerpt","created_at","updated_at",
      "is_published","image_url"
    ],
    include: [
      {
        model: UserModel,
        as: "user",
        attributes: ["id", "full_name", "email"],
      },
      ] 
  });

  return NextResponse.json(rows);
}

/** POST /api/posts  (JSON)
 * { title, slug?, excerpt?, content?, image_url?, is_published?, user_id? }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.title || !body.content) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  // Tạo slug duy nhất
  const slug = await makeUniqueSlug(toSlug(body.slug || body.title));

  // Tạo bài viết mới
  const newPost = await PostModel.create({
    title: body.title,
    slug,
    excerpt: body.excerpt,
    content: body.content,
    image_url: body.image_url || null,
    is_published: body.is_published ? 1 : 0,
    user_id: body.user_id ? Number(body.user_id) : null,
  });

  return NextResponse.json(newPost);
}