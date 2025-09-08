// app/api/coupons/validate/route.ts
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { CouponModel } from "@/app/lib/models";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ valid: false, message: "Thiếu code" }, { status: 400 });
  }

  const now = new Date();

  const coupon = await CouponModel.findOne({
    where: {
      code,
      [Op.and]: [
        {
          [Op.or]: [
            { valid_from: null },
            { valid_from: { [Op.lte]: now } }
          ]
        },
        {
          [Op.or]: [
            { valid_to: null },
            { valid_to: { [Op.gte]: now } }
          ]
        }
      ]
    },
    raw: true,
  });

  if (!coupon) {
    return NextResponse.json({ valid: false, message: "Mã không hợp lệ hoặc đã hết hạn" }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    discount_percent: coupon.get('discount_percent'),
    usage_limit: coupon.get('usage_limit'),
    valid_from: coupon.get('valid_from'),
    valid_to: coupon.get('valid_to'),
  });
}
