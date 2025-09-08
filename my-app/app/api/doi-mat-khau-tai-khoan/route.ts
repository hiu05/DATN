/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = RowDataPacket & { id: number; password_hash: string | null };

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();
    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ message: "Thiếu dữ liệu." }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ message: "Mật khẩu mới phải ≥ 6 ký tự." }, { status: 400 });
    }

    const conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "newtime_watch",
    });

    const [rows] = await conn.execute<Row[]>(
      "SELECT id, password_hash FROM users WHERE email=? LIMIT 1",
      [email]
    );
    const row = rows[0];
    if (!row) {
      await conn.end();
      return NextResponse.json({ message: "Tài khoản không tồn tại." }, { status: 404 });
    }

    const ok = await bcrypt.compare(currentPassword, row.password_hash || "");
    if (!ok) {
      await conn.end();
      return NextResponse.json({ message: "Mật khẩu hiện tại không đúng." }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    const [cols] = await conn.query<RowDataPacket[]>(
      "SHOW COLUMNS FROM users LIKE 'updated_at'"
    );
    const hasUpdatedAt = cols.length > 0;

    if (hasUpdatedAt) {
      await conn.execute(
        "UPDATE users SET password_hash=?, updated_at=NOW() WHERE id=?",
        [newHash, row.id]
      );
    } else {
      await conn.execute(
        "UPDATE users SET password_hash=? WHERE id=?",
        [newHash, row.id]
      );
    }

    await conn.end();
    return NextResponse.json({ message: "OK" });
  } catch (err: any) {
    console.error("[/api/doi-mat-khau-tai-khoan] error:", err);
    return NextResponse.json(
      { message: "Lỗi máy chủ", error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
