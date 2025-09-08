import { NextRequest, NextResponse } from "next/server";
import { sequelize, ProductModel, UserModel, CommentModel } from "@/lib/database";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product_id = Number(searchParams.get("product_id") || 0);
  if (!product_id) return NextResponse.json({ error: "product_id required" }, { status: 400 });

  const items = await CommentModel.findAll({
    where: { product_id },
    include: [{ model: UserModel, as: "user", attributes: ["id", "name", "email"] }],
    order: [["created_at", "DESC"]],
    limit: 100,
  });

  // summary
  const counts = await CommentModel.findAll({
    where: { product_id },
    attributes: ["rating", [sequelize.fn("COUNT", "*"), "c"]],
    group: ["rating"], raw: true,
  });
  const total = counts.reduce((s: number, r: any) => s + Number(r.c), 0);
  const sum = counts.reduce((s: number, r: any) => s + Number(r.rating) * Number(r.c), 0);
  const average = total ? Math.round((sum / total) * 10) / 10 : 0;
  const histogram: Record<number, number> = {1:0,2:0,3:0,4:0,5:0};
  counts.forEach((r: any) => { histogram[Number(r.rating)] = Number(r.c); });

  return NextResponse.json({ items, summary: { average, count: total, histogram } });
}

export async function POST(req: NextRequest) {
  const { user_id, product_id, rating, comment } = await req.json();
  if (!user_id || !product_id || !rating || !comment?.trim()) {
    return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating phải 1..5" }, { status: 400 });
  }
  // (Optional) kiểm tra tồn tại:
  // const [u, p] = await Promise.all([UserModel.findByPk(user_id), ProductModel.findByPk(product_id)]);
  // if (!u || !p) return NextResponse.json({ error: "user/product không tồn tại" }, { status: 400 });

  const row = await CommentModel.create({
    user_id, product_id, rating, comment: String(comment).slice(0, 1000), created_at: new Date(),
  });

  return NextResponse.json(row);
}
