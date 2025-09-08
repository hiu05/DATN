import { NextResponse } from "next/server";
import { OrderModel, OrderItemModel, ProductModel, UserModel, CouponModel, sequelize as db } from "@/app/lib/models";

// GET /api/orders/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const row = await OrderModel.findByPk(id, {
    include: [
      { model: UserModel, as: "user", attributes: ["id","full_name","email","phone"] },
      { model: CouponModel, as: "coupon", attributes: ["id","code","discount_type","discount_value"], required: false },
      {
        model: OrderItemModel,
        as: "items",
        include: [{ model: ProductModel, as: "product", attributes: ["id","name","slug","price"] }],
      },
    ],
  });
  if (!row) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(row);
}

/**
 * PUT /api/orders/:id
 * Body JSON: cho phép update các field và/hoặc thay items
 * {
 *   "status": "Đang xử lý",
 *   "receiver_name": "...", "receiver_phone": "...", "shipping_address": "...",
 *   "payment_method": "...", "note": "...",
 *   "items": [ { product_id, quantity, unit_price }, ... ]   // (tùy chọn) gửi nếu muốn thay
 * }
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const t = await db.transaction();
  try {
    const data: any = {
      receiver_name: body.receiver_name ?? undefined,
      receiver_phone: body.receiver_phone ?? undefined,
      shipping_address: body.shipping_address ?? undefined,
      payment_method: body.payment_method ?? undefined,
      note: body.note ?? undefined,
      status: body.status ?? undefined,
      coupon_id: body.coupon_id ?? undefined,
    };
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    if (body.items && Array.isArray(body.items)) {
      // tính lại tổng nếu có items
      const total_amount = body.items.reduce(
        (s: number, it: any) => s + Number(it.unit_price) * Number(it.quantity), 0
      );
      data.total_amount = total_amount;
    }

    await OrderModel.update(data, { where: { id }, transaction: t });

    if (body.items && Array.isArray(body.items)) {
      // xoá items cũ & ghi items mới (đơn giản)
      await OrderItemModel.destroy({ where: { order_id: id }, transaction: t });
      const rows = body.items.map((it: any) => ({
        order_id: id,
        product_id: Number(it.product_id),
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      }));
      await OrderItemModel.bulkCreate(rows, { transaction: t });
    }

    await t.commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    await t.rollback();
    console.error("Update order error:", e);
    return NextResponse.json({ error: "Không thể cập nhật đơn hàng" }, { status: 500 });
  }
}

// DELETE /api/orders/:id (xoá cứng; nếu muốn huỷ mềm thì đổi thành update status = "Đã hủy")
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const t = await db.transaction();
  try {
    await OrderItemModel.destroy({ where: { order_id: id }, transaction: t });
    await OrderModel.destroy({ where: { id }, transaction: t });
    await t.commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    await t.rollback();
    console.error("Delete order error:", e);
    return NextResponse.json({ error: "Không thể xoá đơn hàng" }, { status: 500 });
  }
}
