/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { BannerModel } from "@/app/lib/models";

// GET /api/banners/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const banner = await BannerModel.findByPk(params.id);
  if (!banner) return NextResponse.json({ error: "Không tìm thấy banner" }, { status: 404 });
  return NextResponse.json(banner);
}

// PUT /api/banners/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const banner = await BannerModel.findByPk(params.id) as any;
  if (!banner) return NextResponse.json({ error: "Không tìm thấy banner" }, { status: 404 });

  const body = await req.json();
  await banner.update({
    image_url: body.image_url ?? banner.image_url,
    valid_from: body.valid_from ? new Date(body.valid_from) : banner.valid_from,
    valid_to: body.valid_to ? new Date(body.valid_to) : banner.valid_to,
    status: body.status ?? banner.status,
  });

  return NextResponse.json(banner);
}

// DELETE /api/banners/:id
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const banner = await BannerModel.findByPk(params.id);
  if (!banner) return NextResponse.json({ error: "Không tìm thấy banner" }, { status: 404 });

  await banner.destroy();
  return NextResponse.json({ message: "Đã xóa banner" });
}
