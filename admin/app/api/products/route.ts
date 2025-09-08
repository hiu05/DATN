import { ProductModel, ProductImageModel } from "@/app/lib/models";
import { NextResponse } from "next/server";
import { BrandModel } from "@/app/lib/models";
// api thêm sản phẩm mới, method POST
export async function POST(req: Request) {
  const formData = await req.formData();
  // Lấy dữ liệu từ form
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const brand_id = formData.get("brand_id") as string;
  const price = formData.get("price") as string;
  const discount_price = formData.get("discount_price") as string;
  const description = formData.get("description") as string;
  const gender = formData.get("gender") as string;
  const movement_type = formData.get("movement_type") as string;
  const strap_material = formData.get("strap_material") as string;
  const crystal = formData.get("crystal") as string;
  const water_resistance = formData.get("water_resistance") as string;
  const stock_quantity = formData.get("stock_quantity") as string;
  const view = 0;
  const status = Number(formData.get("status"));
  const sort_order = Number(formData.get("sort_order"));
  const hot = Number(formData.get("hot"));
  const images =
    (formData.getAll("images") || [])
      .map((x) => x?.toString().trim())
      .filter(Boolean) as string[];
  const main_image = images[0] || ""; // Lấy ảnh đầu tiên làm ảnh chính
  // Thêm sản phẩm mới vào database
  const sequelize = ProductModel.sequelize!;
  const t = await sequelize.transaction();
  try {
    const product = await ProductModel.create({
      name,
      slug,
      brand_id: Number(brand_id),
      price: Number(price),
      discount_price: Number(discount_price),
      description,
      gender,
      movement_type,
      strap_material,
      crystal,
      water_resistance,
      stock_quantity: Number(stock_quantity),
      view,
      status,
      sort_order,
      hot
    },
   { transaction: t });
    if (images.length > 0) {
      const rows = images.map((url) => ({
        product_id: product.getDataValue("id"),
        image_url: url,
        is_main: url === main_image ? 1 : 0,
      }));
      await ProductImageModel.bulkCreate(rows, { transaction: t });
    }

    await t.commit();
    return NextResponse.json(
      { message: "Tạo sản phẩm thành công", product_id: product.getDataValue("id"), slug },
      { status: 201 }
    );
  } catch (err) {
    await t.rollback();
    console.error("❌ Lỗi khi tạo sản phẩm:", err);
    return NextResponse.json({ error: "Không thể tạo sản phẩm" }, { status: 500 });
  } 
}

// api trả về ds sản phẩm phân trang
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  
  const sp_arr = await ProductModel.findAll({
    order: [["sort_order", "asc"]],
    limit,
    offset,
    include: [
      {
        model: BrandModel,
        as: "brand",
        attributes: ["name"], // chỉ lấy tên brand
      },
      {
        model: ProductImageModel,
        as: "images",
        attributes: ["id", "image_url", "is_main"], // lấy tất cả ảnh
      },
    ],
  });
  return NextResponse.json(sp_arr);
}

