import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { OrderModel, OrderItemModel, ProductModel, UserModel, CouponModel,} from "@/app/lib/models";

// GET /api/orders?limit=&offset=&q=&status=&user_id=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit  = Number(searchParams.get("limit"))  || 20;
  const offset = Number(searchParams.get("offset")) || 0;

  const rows = await OrderModel.findAll({
    order: [["id", "desc"]],
    limit,
    offset,
    include: [
      { model: UserModel, as: "user", attributes: ["id","full_name","email","phone"] },
      {
        model: OrderItemModel,
        as: "items",
        include: [{ model: ProductModel, as: "product", attributes: ["id","name","price","slug"] }],
      },
    ],
  });

  return NextResponse.json(rows);
}


/**
 * POST /api/orders
 * Body JSON:
 * {
 *   "user_id": 1, "receiver_name": "...", "receiver_phone": "...",
 *   "shipping_address": "...", "payment_method": "COD",
 *   "note": "...", "coupon_id": 2, "status": "Chờ xác nhận",
 *   "items": [ { "product_id": 10, "quantity": 2, "unit_price": 990000 }, ... ]
 * }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    user_id, receiver_name, receiver_phone, shipping_address,
    payment_method, note, coupon_id, status = "Chờ xác nhận",
    items = [],
  } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Thiếu items" }, { status: 400 });
  }

  // tính tổng
  const total_amount = items.reduce((s: number, it: any) => s + Number(it.unit_price) * Number(it.quantity), 0);

  const t = await db.transaction();
  try {
    const order = await OrderModel.create({
      user_id, receiver_name, receiver_phone, shipping_address,
      payment_method, note, coupon_id: coupon_id || null, status, total_amount,
    }, { transaction: t });

    const order_id = order.getDataValue("id");

    const rows = items.map((it: any) => ({
      order_id,
      product_id: Number(it.product_id),
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));
    await OrderItemModel.bulkCreate(rows, { transaction: t });

    // (tuỳ chọn) trừ tồn kho
    // for (const it of rows) {
    //   await ProductModel.decrement({ stock_quantity: it.quantity }, { where: { id: it.product_id }, transaction: t });
    // }

    await t.commit();
    return NextResponse.json({ id: order_id }, { status: 201 });
  } catch (e) {
    await t.rollback();
    console.error("Create order error:", e);
    return NextResponse.json({ error: "Không thể tạo đơn hàng" }, { status: 500 });
  }
}
