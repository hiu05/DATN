/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

async function createTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("Thiếu SMTP_USER/SMTP_PASS trong .env.local");

  const primary = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  try {
    await primary.verify();
    return primary;
  } catch (err) {
    console.warn("SMTP 465 verify fail, fallback 587 STARTTLS:", err);
  }

  const fallback = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
      servername: "smtp.gmail.com",
      minVersion: "TLSv1.2",
    },
  });

  await fallback.verify();
  return fallback;
}

function buildEmailHTML(resetLink: string) {
  const brandColor = "#e23c31"; 
  const textColor = "#111827";
  const muted = "#6b7280";

  return `
  <!doctype html>
  <html lang="vi">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Khôi phục mật khẩu</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;">
    <div style="width:100%;padding:24px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #eef0f5;box-shadow:0 6px 18px rgba(17,24,39,0.06);">
        <tr>
          <td style="padding:24px 24px 8px 24px;">
            <div style="font-weight:700;font-size:18px;color:${textColor};font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              Time Watch
            </div>
            <div style="margin-top:4px;font-size:12px;color:${muted};font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              Thông báo khôi phục mật khẩu
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 24px 0 24px;">
            <p style="margin:0 0 12px 0;color:${textColor};font-size:14px;line-height:1.6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản của mình.
            </p>
            <p style="margin:0 0 16px 0;color:${textColor};font-size:14px;line-height:1.6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu. Liên kết sẽ <strong>hết hạn trong 15 phút</strong>.
            </p>

            <!-- Nút đỏ -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 8px 0;">
              <tr>
                <td align="left" bgcolor="${brandColor}" style="border-radius:10px;">
                  <a href="${resetLink}" target="_blank" rel="noopener noreferrer"
                     style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                    Nhấp vào đây để đổi mật khẩu
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:8px 0 0 0;color:${muted};font-size:12px;line-height:1.6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px 20px 24px;">
            <hr style="border:none;border-top:1px solid #eef0f5;margin:0 0 12px 0;" />
            <div style="color:${muted};font-size:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
              © ${new Date().getFullYear()} Time Watch — Bảo mật là ưu tiên hàng đầu của chúng tôi.
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Thiếu email" }, { status: 400 });
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "newtime_watch",
  });

  try {
    const [rows]: any = await conn.execute(
      "SELECT id,email FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      await conn.end();
      return NextResponse.json({ message: "Email không tồn tại" }, { status: 404 });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "15m" }
    );

    const appUrl = process.env.APP_URL || "http://localhost:3001";
    const resetLink = `${appUrl}/dat-lai-mat-khau?token=${token}`;

    const transporter = await createTransporter();

    await transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        `Time Watch <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Khôi phục mật khẩu",
      text: `Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Time Watch.

Nhấn vào liên kết sau để đặt lại mật khẩu (hết hạn trong 15 phút):
${resetLink}

Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`,
      html: buildEmailHTML(resetLink),
    });

    return NextResponse.json({ message: "Gửi email thành công" });
  } catch (error: any) {
    if (error?.code === "EAUTH" || /Invalid login|535-5\.7\.8/i.test(String(error?.response))) {
      return NextResponse.json(
        { message: "SMTP đăng nhập thất bại. Kiểm tra EMAIL_USER/EMAIL_PASS (App Password 16 ký tự) & bật 2FA." },
        { status: 500 }
      );
    }
    if (error?.code === "ESOCKET" && /self-signed certificate/i.test(String(error?.message))) {
      return NextResponse.json(
        { message: "TLS bị chặn (self-signed). Ở dev đã bật STARTTLS + relax TLS; production nên dùng SMTP khác (Brevo/Mailgun/Resend)." },
        { status: 500 }
      );
    }
    console.error("Lỗi gửi email:", error);
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  } finally {
    await conn.end();
  }
}
