import { BrandModel, ProductModel } from "@/app/lib/models";
import { IBrand } from "@/app/lib/cautrucdata";
import { NextResponse } from "next/server";

// Xử lý POST request để tạo mới brand
export async function POST(req: Request) {
  const formData = await req.formData();
  // Lấy dữ liệu từ form
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = Number(formData.get("status"));
  const sort_order = formData.get("sort_order") === "1";
  const logo_url = formData.get("logo_url") as string;
  await BrandModel.create({ name, slug, status, sort_order, logo_url });   // lưu vào database
  return NextResponse.redirect(new URL("/brands", req.url)); //chuyển về trang ds loại
}

// api trả về ds brand phân trang kèm số lượng sản phẩm mỗi brand
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;
  // Lấy danh sách brand
  const brand_arr: IBrand[] = await BrandModel.findAll({
    order: [["sort_order", "ASC"]],
    limit,
    offset,
    raw: true,
  });
  // Lấy số lượng sản phẩm theo từng brand
  const ids = brand_arr.map((b) => b.id);
  const counts = await ProductModel.findAll({
    attributes: ["brand_id", [ProductModel.sequelize!.fn("COUNT", ProductModel.sequelize!.col("id")), "so_luong"]],
    where: { brand_id: ids },
    group: ["brand_id"],
    raw: true,
  });
  // Gán số lượng vào từng brand
  const brandWithCount = brand_arr.map((b) => {
    const found = counts.find((c: any) => c.brand_id === b.id);
    return { ...b, so_luong: found ? Number(found.so_luong) : 0 };
  });
  return NextResponse.json(brandWithCount);
}