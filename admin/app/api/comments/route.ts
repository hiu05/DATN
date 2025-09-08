/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { CommentModel } from "@/app/lib/models"; // Sequelize model bạn đã định nghĩa

// GET /api/comments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const rows = await CommentModel.findAll({
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.user_id || !body.product_id || !body.rating) {
      return NextResponse.json(
        { error: "Thiếu user_id, product_id hoặc rating" },
        { status: 400 }
      );
    }

    const comment = await CommentModel.create({
      user_id: body.user_id,
      product_id: body.product_id,
      rating: body.rating,
      comment: body.comment ?? null,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
