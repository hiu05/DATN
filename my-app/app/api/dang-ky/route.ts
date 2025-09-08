/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { ho_ten, email, mat_khau, sdt } = await req.json();

  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "newtime_watch",
  });

  try {
    const [rows]: any = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (rows.length > 0) {
      return NextResponse.json({ message: "Email đã tồn tại!" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(mat_khau, 10);

    await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, phone, role, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [ho_ten, email, hashed, sdt, "user"]
    );

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "XACTHUC123", {
      expiresIn: "1h",
    });

    const appUrl = process.env.APP_URL || "http://localhost:3001";
    const link = `${appUrl}/api/xac-thuc?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "anhlvpps39871@gmail.com",
        pass: "jhtgbodowbulicje",
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: '"Time Watch" <anhlvpps39871@gmail.com>',
      to: email,
      subject: "Xác thực tài khoản - Time Watch",
      html: `
        <p>Xin chào <b>${ho_ten}</b>,</p>
        <p>Vui lòng xác thực tài khoản của bạn bằng cách bấm vào liên kết dưới đây:</p>
        <p><a href="${link}">Xác thực tài khoản</a></p>
        <p>Liên kết sẽ hết hạn trong 1 giờ.</p>
      `,
    });

    return NextResponse.json({
      message: "Đăng ký thành công! Kiểm tra email để xác thực.",
    });
  } catch (err) {
    console.error("Lỗi server:", err);
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  } finally {
    await connection.end();
  }
}
