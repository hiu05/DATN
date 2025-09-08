// app/api/coupons/route.ts
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { CouponModel } from "@/app/lib/models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);
  const q = searchParams.get("q") ?? "";

  const where = q
    ? { code: { [Op.like]: `%${q}%` } }
    : {};

  const items = await CouponModel.findAll({
    where,
    order: [["id", "DESC"]],
    limit,
    offset,
    raw: true,
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.code || !body.discount_percent) {
    return NextResponse.json(
      { message: "Thiếu code hoặc discount_percent" },
      { status: 400 }
    );
  }

  const created = await CouponModel.create({
    code: String(body.code).trim(),
    discount_percent: Number(body.discount_percent),
    valid_from: body.valid_from || null,
    valid_to: body.valid_to || null,
    usage_limit: body.usage_limit ?? 0,
  });

  return NextResponse.json(created, { status: 201 });
}
