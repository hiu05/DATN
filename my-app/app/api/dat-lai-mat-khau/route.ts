/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const email = decoded.email as string;

    const hash = await bcrypt.hash(newPassword, 10);

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "newtime_watch",
    });

    const [result]: any = await connection.execute(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hash, email]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Email không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cập nhật mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi đặt lại mật khẩu:", err);
    return NextResponse.json(
      { message: "Token không hợp lệ hoặc đã hết hạn" },
      { status: 401 }
    );
  }
}
