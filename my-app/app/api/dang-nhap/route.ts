/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, mat_khau } = await req.json();

  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "newtime_watch",
  });

  try {
    const [rows]: any = await connection.execute(
      "SELECT id, full_name, email, password_hash, phone, status FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "Email không tồn tại" }, { status: 400 });
    }

    const user = rows[0];

    const match = await bcrypt.compare(mat_khau, user.password_hash);
    if (!match) return NextResponse.json({ message: "Sai mật khẩu" }, { status: 400 });

    if (user.status !== null && user.status !== undefined && Number(user.status) === 0) {
      return NextResponse.json({ message: "Tài khoản bị khóa" }, { status: 403 });
    }

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        dien_thoai: user.phone,
      },
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
