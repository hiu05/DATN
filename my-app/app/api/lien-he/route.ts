/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const PORT = Number(process.env.SMTP_PORT || 465);

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

async function createTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("Thiếu SMTP_USER/SMTP_PASS trong .env.local");

  // Ưu tiên 465 (SSL)
  const primary = nodemailer.createTransport({
    host: HOST,
    port: PORT,              // 465 nếu không set
    secure: PORT === 465,    // SSL cho 465
    auth: { user, pass },
  });

  try {
    await primary.verify();
    return primary;
  } catch (e) {
    console.warn("SMTP verify thất bại, fallback 587 STARTTLS:", e);
  }

  const fallback = nodemailer.createTransport({
    host: HOST,
    port: 587,
    secure: false,          // STARTTLS
    requireTLS: true,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2", servername: HOST },
  });

  await fallback.verify();
  return fallback;
}

function buildContactHTML(p: { fullname: string; email: string; phone: string; message: string }) {
  const brand = "#e23c31";
  const text = "#111827";
  const muted = "#6b7280";
  const { fullname, email, phone, message } = p;
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Phản hồi Time Watch")}`;

  return `<!doctype html><html lang="vi"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f5f7fb">
<div style="width:100%;padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eef0f5;border-radius:12px;box-shadow:0 6px 18px rgba(17,24,39,.06)">
  <tr><td style="padding:20px 24px 8px 24px">
    <div style="font:700 18px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:${text}">Time Watch</div>
    <div style="margin-top:4px;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Liên hệ từ khách hàng</div>
  </td></tr>
  <tr><td style="padding:8px 24px 0 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 8px">
      <tr><td style="width:140px;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Họ tên</td>
          <td style="color:${text};font:14px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${fullname}</td></tr>
      <tr><td style="width:140px;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Email</td>
          <td style="color:${text};font:14px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${email}</td></tr>
      <tr><td style="width:140px;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Số điện thoại</td>
          <td style="color:${text};font:14px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${phone}</td></tr>
    </table>
    <div style="margin:10px 0 6px 0;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Nội dung</div>
    <div style="padding:12px;border:1px solid #eef0f5;border-radius:8px;background:#fafafa;color:${text};font:14px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
      ${String(message || "").replace(/\n/g, "<br/>")}
    </div>
    <table role="presentation" style="margin:16px 0 8px 0"><tr><td bgcolor="${brand}" style="border-radius:10px">
      <a href="${mailto}" style="display:inline-block;padding:12px 18px;color:#fff;text-decoration:none;font:700 14px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">Trả lời khách</a>
    </td></tr></table>
    <p style="margin:8px 0 0 0;color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
      Email này được gửi tự động từ form Liên hệ trên website Time Watch.
    </p>
  </td></tr>
  <tr><td style="padding:16px 24px 20px 24px">
    <hr style="border:none;border-top:1px solid #eef0f5;margin:0 0 12px 0"/>
    <div style="color:${muted};font:12px system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">© ${new Date().getFullYear()} Time Watch</div>
  </td></tr>
</table>
</div></body></html>`;
}

export async function POST(req: Request) {
  // Parse JSON an toàn
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body phải là JSON" }, { status: 400 });
  }

  // Chấp nhận fullname / name / fullName
  const fullname = String(body?.fullname ?? body?.name ?? body?.fullName ?? "").trim();
  const email    = String(body?.email ?? "").trim();
  const phone    = String(body?.phone ?? "").trim();
  const message  = String(body?.message ?? body?.content ?? "").trim();

  if (!fullname || !email || !message) {
    return NextResponse.json({ message: "Thiếu họ tên / email / nội dung" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ message: "Email khách không hợp lệ" }, { status: 400 });
  }

  const user = process.env.SMTP_USER || process.env.EMAIL_USER || "";
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || "";
  const to   = process.env.CONTACT_TO || user;

  if (!user || !pass || !to || !isEmail(to)) {
    console.error("ENV_MISSING", { hasUser: !!user, hasPass: !!pass, to });
    return NextResponse.json(
      { message: "Thiếu CONTACT_TO hoặc SMTP_USER/SMTP_PASS trong .env.local" },
      { status: 500 }
    );
  }

  try {
    const transporter = await createTransporter();
    const subject = `Liên hệ từ khách hàng: ${fullname}${phone ? " - " + phone : ""}`;

    const info = await transporter.sendMail({
      // Gmail yêu cầu from cùng tài khoản; vẫn có thể đặt tên hiển thị
      from: process.env.MAIL_FROM || `Time Watch <${user}>`,
      to,
      cc: process.env.COMPLAINT_NOTIFY_CC || undefined,
      replyTo: email,
      subject,
      text: `Họ tên: ${fullname}\nEmail: ${email}\nSĐT: ${phone}\n\nNội dung:\n${message}\n`,
      html: buildContactHTML({ fullname, email, phone, message }),
    });

    console.log("MAIL_SENT", info.messageId);
    return NextResponse.json({ ok: true, message: "Đã gửi mail xong" });
  } catch (err: any) {
    console.error("MAIL_ERROR", err?.code, err?.response, err?.message);
    return NextResponse.json({ message: err?.message || "Không thể gửi mail" }, { status: 500 });
  }
}
