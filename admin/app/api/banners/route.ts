/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { BannerModel } from "@/app/lib/models";

// GET /api/banners
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const rows = await BannerModel.findAll({
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/banners error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/banners
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.image_url) {
      return NextResponse.json({ error: "Thiếu image_url" }, { status: 400 });
    }

    const banner = await BannerModel.create({
      image_url: body.image_url,
      valid_from: body.valid_from ? new Date(body.valid_from) : null,
      valid_to: body.valid_to ? new Date(body.valid_to) : null,
      status: body.status ?? 1,
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/banners error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
