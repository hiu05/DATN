// /app/api/banners/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: mysql.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "newtime_watch",
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4_general_ci",
    });
  }
  return pool;
}

interface BannerRow extends RowDataPacket {
  id: number;
  image_url: string;
  valid_from: Date | null;
  valid_to: Date | null;
  status: number;
}

export async function GET() {
  try {
    const conn = await getPool().getConnection();
    // TẠM thời nới lỏng filter ngày cho dễ test:
    const [rows] = await conn.query<BannerRow[]>(
      `SELECT id, image_url, valid_from, valid_to, status
       FROM banners
       WHERE status = 1
       ORDER BY id DESC`
    );
    conn.release();

    const base =
      (process.env.NEXT_PUBLIC_IMAGE_BASE ||
        process.env.APP_BASE_URL ||
        "http://localhost:3000").replace(/\/+$/, "");

    // Trả ra URL tuyệt đối luôn
    const images = rows
      .map((r) => {
        const u = r.image_url?.trim() || "";
        if (!u) return "";
        if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")) {
          return u; // đã là tuyệt đối (hoặc /public)
        }
        // tương đối -> prefix domain
        return `${base}/${u.replace(/^\/+/, "")}`;
      })
      .filter(Boolean);

    return NextResponse.json({ images, count: images.length });
  } catch (e) {
    console.error("GET /api/banners error:", e);
    return NextResponse.json({ images: [], count: 0 }, { status: 500 });
  }
}
