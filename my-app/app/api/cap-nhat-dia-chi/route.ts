/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/cap-nhat-dia-chi/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

type Body = {
  email?: string;
  address?: string;
  phone?: string;
};

export async function POST(req: Request) {
  try {
    const { email: rawEmail, address: rawAddress, phone: rawPhone } =
      (await req.json()) as Body;

    const email = rawEmail?.trim().toLowerCase();
    const address = rawAddress?.trim();
    const phone = rawPhone?.trim() || null;

    if (!email || !address) {
      return NextResponse.json(
        { message: "Thiếu dữ liệu: email và address là bắt buộc." },
        { status: 400 }
      );
    }

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST ?? "localhost",
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME ?? "newtime_watch",
    });

    const [rows] = await conn.execute("SELECT id FROM users WHERE email=? LIMIT 1", [email]);
    if (!(rows as any[]).length) {
      await conn.end();
      return NextResponse.json({ message: "Tài khoản không tồn tại." }, { status: 404 });
    }

    const [cols] = await conn.execute("SHOW COLUMNS FROM users LIKE 'updated_at'");
    const hasUpdatedAt = (cols as any[]).length > 0;

    const sql = hasUpdatedAt
      ? "UPDATE users SET address=?, phone=?, updated_at=NOW() WHERE email=?"
      : "UPDATE users SET address=?, phone=? WHERE email=?";

    await conn.execute(sql, [address, phone, email]);
    await conn.end();

    return NextResponse.json({
      ok: true,
      message: "Cập nhật địa chỉ thành công.",
      address,
      phone,
    });
  } catch (err) {
    console.error("cap-nhat-dia-chi POST error:", err);
    return NextResponse.json({ message: "Lỗi máy chủ." }, { status: 500 });
  }
}
