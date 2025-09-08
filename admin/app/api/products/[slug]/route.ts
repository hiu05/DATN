import { NextResponse } from "next/server";
import { ProductModel, ProductImageModel, BrandModel } from "@/app/lib/models";

// Chi tiết theo slug
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const row = await ProductModel.findOne({
    where: { slug: params.slug },
    include: [
      { model: BrandModel, as: "brand", attributes: ["id","name"] },
      { model: ProductImageModel, as: "images", attributes: ["id","image_url","is_main"] },
    ],
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug: paramSlug } = await ctx.params; // ← bắt buộc await
  const body = await req.json().catch(() => ({}));

  const t = await ProductModel.sequelize!.transaction();
  try {
    // 1) Tìm sản phẩm theo slug gốc từ URL để lấy id
    const existing = await ProductModel.findOne({
      where: { slug: paramSlug },
      attributes: ["id", "slug"],
      transaction: t,
    });

    if (!existing) {
      await t.rollback();
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const pid = existing.getDataValue("id");

    // 2) Chuẩn bị dữ liệu cập nhật (chỉ cập nhật field được gửi)
    const data: Record<string, any> = {
      name: body.name,
      slug: body.slug ?? existing.getDataValue("slug"), // có thể đổi slug mới
      brand_id: body.brand_id,
      price: body.price,
      discount_price: body.discount_price,
      description: body.description,
      gender: body.gender,
      movement_type: body.movement_type,
      strap_material: body.strap_material,
      crystal: body.crystal,
      water_resistance: body.water_resistance,
      stock_quantity: body.stock_quantity,
      status: body.status,
      sort_order: body.sort_order,
      hot: body.hot,
    };
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

    // 3) Cập nhật theo id (ổn định, không phụ thuộc slug thay đổi)
    await ProductModel.update(data, { where: { id: pid }, transaction: t });

    // 4) Ảnh: nếu body.images được gửi, xoá toàn bộ ảnh cũ rồi thêm mới
    if (Array.isArray(body.images)) {
      await ProductImageModel.destroy({ where: { product_id: pid }, transaction: t });

      const rows = body.images.map((url: string) => ({
        product_id: pid,
        image_url: url,
        is_main: body.main_image ? (url === body.main_image ? 1 : 0) : 0,
      }));
      if (rows.length) {
        await ProductImageModel.bulkCreate(rows, { transaction: t });
      }
    } else if (typeof body.main_image === "string") {
      // Chỉ đổi ảnh chính
      await ProductImageModel.update({ is_main: 0 }, { where: { product_id: pid }, transaction: t });
      await ProductImageModel.update(
        { is_main: 1 },
        { where: { product_id: pid, image_url: body.main_image }, transaction: t }
      );
    }

    await t.commit();

    // (tuỳ chọn) trả về bản ghi mới nhất
    const fresh = await ProductModel.findByPk(pid, {
      include: [{ model: ProductImageModel, as: "images" }],
      attributes: { exclude: [] },
    });
    return NextResponse.json(fresh ?? { updated: true });
  } catch (e) {
    await t.rollback();
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}