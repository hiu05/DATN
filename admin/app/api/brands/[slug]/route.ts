import { NextResponse } from "next/server";
import { BrandModel } from "@/app/lib/models"; // Đảm bảo bạn đã export đúng ở file database
import { ProductModel } from "@/app/lib/models"; // Import model Product nếu cần

// Xóa 1 brand, method DELETE
export async function DELETE(req: Request, context: { params: { slug: string } }) {
    const { slug } = await context.params;
    const brand = await BrandModel.findOne({
        where: { slug },
    }) ; 
    if (!brand) {
        return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }
    const isProductExist = await ProductModel.count({
        where: { brand_id: brand.id },
    });
    // Kiểm tra nếu brand có sản phẩm liên kết
    if (isProductExist > 0) {  
        return NextResponse.json({ message: "Không thể xóa hãng vì còn sản phẩm liên kết" }, { status: 400 });
    }
    await brand.destroy();
    return NextResponse.redirect(new URL("/brands", req.url));
}

// Lấy brand theo slug
export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    const brand = await BrandModel.findOne({ where: { slug } });
    if (!brand) return NextResponse.json(
        { thong_bao: "Không tìm thấy hãng" }, { status: 404 }
    );
    return NextResponse.json(brand);
}

// Cập nhật brand (POST)
export async function POST(req: Request, context: { params: Promise<{ slug: string }> }) {
    const { slug } = await context.params;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const sort_order = Number(formData.get("sort_order"));
    const status = formData.get("status") === "1";
    const brand = await BrandModel.findOne({ where: { slug } });
    if (!brand) return NextResponse.json(
        { message: "Không tìm thấy hãng" }, { status: 404 }
    );
    await brand.update({ name, sort_order, status });
    return NextResponse.redirect(new URL("/brands", req.url));
}