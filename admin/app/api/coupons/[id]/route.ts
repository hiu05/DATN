// app/api/coupons/[id]/route.ts
import { NextResponse } from "next/server";
// Update the import path below if '@/lib/models' is incorrect.
// For example, if models.ts is at 'c:\Users\ADMIN\Downloads\DuAnTN\admin\lib\models.ts', use:
import { CouponModel } from "../../../lib/models";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = await CouponModel.findByPk(params.id, { raw: true });
  if (!item) return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const item = await CouponModel.findByPk(params.id);
  if (!item) return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });

  await item.update({
    code: body.code ?? item.get("code"),
    discount_percent: body.discount_percent ?? item.get("discount_percent"),
    valid_from: body.valid_from ?? item.get("valid_from"),
    valid_to: body.valid_to ?? item.get("valid_to"),
    usage_limit: body.usage_limit ?? item.get("usage_limit"),
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = await CouponModel.findByPk(params.id);
  if (!item) return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });

  await item.destroy();
  return NextResponse.json({ success: true });
}
