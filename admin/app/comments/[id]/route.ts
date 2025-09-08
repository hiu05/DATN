/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { CommentModel } from "@/app/lib/models";

// GET /api/comments/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const comment = await CommentModel.findByPk(params.id);
    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận" }, { status: 404 });
    }
    return NextResponse.json(comment);
  } catch (err: any) {
    console.error("GET /api/comments/:id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/comments/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const comment = await CommentModel.findByPk(params.id);
    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận" }, { status: 404 });
    }

    // Type assertion to inform TypeScript about the expected properties
    const typedComment = comment as any;

    const body = await req.json();
    await typedComment.update({
      user_id: body.user_id ?? typedComment.user_id,
      product_id: body.product_id ?? typedComment.product_id,
      rating: body.rating ?? typedComment.rating,
      comment: body.comment ?? typedComment.comment,
    });

    return NextResponse.json(typedComment);
  } catch (err: any) {
    console.error("PUT /api/comments/:id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/comments/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const comment = await CommentModel.findByPk(params.id);
    if (!comment) {
      return NextResponse.json({ error: "Không tìm thấy bình luận" }, { status: 404 });
    }

    await comment.destroy();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/comments/:id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
