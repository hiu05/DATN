// /app/api/khieu-nai/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== DB POOL ===================== */
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

/* ===================== HELPERS ===================== */
function ticketCode() {
  return "KN-" + Math.floor(100000 + Math.random() * 900000);
}
function safeFileName(name: string) {
  const base = name.normalize("NFKD").replace(/[^\w.\-]+/g, "_");
  return base.slice(0, 180);
}
function isAllowed(mime: string, name: string) {
  const okImage = mime.startsWith("image/");
  const okPdf = mime === "application/pdf" || name.toLowerCase().endsWith(".pdf");
  return okImage || okPdf;
}
async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}
function htmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[ch]
  );
}
function complaintMailHTML(payload: {
  ticket: string;
  full_name: string;
  email: string;
  phone: string;
  order_code?: string;
  topic: string;
  subject: string;
  message: string;
  attachments: { file_name: string; file_url: string }[];
  toAdmin?: boolean;
}) {
  const {
    ticket,
    full_name,
    email,
    phone,
    order_code,
    topic,
    subject,
    message,
    attachments,
    toAdmin,
  } = payload;

  const rows = [
    ["Mã hồ sơ", ticket],
    ["Họ tên", htmlEscape(full_name)],
    ["Email", htmlEscape(email)],
    ["SĐT", htmlEscape(phone)],
    ["Mã đơn hàng", htmlEscape(order_code || "-")],
    ["Nhóm khiếu nại", htmlEscape(topic)],
    ["Tiêu đề", htmlEscape(subject)],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;background:#fafafa;border:1px solid #eee">${k}</td><td style="padding:8px 12px;border:1px solid #eee">${v}</td></tr>`
    )
    .join("");

  const attachList =
    attachments.length === 0
      ? "<em>Không có</em>"
      : `<ul style="margin:6px 0 0 18px">${attachments
          .map((a) => `<li><a href="${a.file_url}">${htmlEscape(a.file_name)}</a></li>`)
          .join("")}</ul>`;

  return `
  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#222">
    <h2>${toAdmin ? "Có khiếu nại mới" : "Xác nhận tiếp nhận khiếu nại"}</h2>
    <p>Xin chào ${toAdmin ? "Team CSKH" : htmlEscape(full_name)},</p>
    <p>${
      toAdmin
        ? "Hệ thống vừa nhận được một khiếu nại mới:"
        : "Chúng tôi đã tiếp nhận khiếu nại của bạn. Thông tin tóm tắt như sau:"
    }</p>
    <table style="border-collapse:collapse;font-size:14px;margin:12px 0 14px 0">${rows}</table>
    <div style="margin:8px 0">
      <strong>Nội dung:</strong>
      <div style="white-space:pre-wrap;border:1px solid #eee;padding:10px;border-radius:8px;background:#fafafa">${htmlEscape(
        message
      )}</div>
    </div>
    <div style="margin:8px 0">
      <strong>Tệp đính kèm:</strong> ${attachList}
    </div>
    <p style="margin-top:14px">
      ${
        toAdmin
          ? "Vui lòng kiểm tra và xử lý trong CRM/Backoffice."
          : "Chúng tôi sẽ phản hồi cho bạn trong thời gian sớm nhất."
      }
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:18px 0"/>
    <p style="font-size:12px;color:#666">TimeWatch • Hotline: (+84) 90 123 4567 • support@timewatch.vn</p>
  </div>`;
}

/* ===================== ROUTE ===================== */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const full_name = String(form.get("full_name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const order_code = String(form.get("order_code") || "").trim();
    const topic = String(form.get("topic") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const message = String(form.get("message") || "").trim();
    const contact_by = (String(form.get("contact_by") || "email") === "phone" ? "phone" : "email") as
      | "email"
      | "phone";

    if (!full_name || !email || !phone || !topic || !subject || !message) {
      return NextResponse.json({ message: "Thiếu dữ liệu bắt buộc." }, { status: 400 });
    }

    const ticket = ticketCode();

    // 1) Lưu complaint
    const conn = await getPool().getConnection();
    let complaintId = 0;
    try {
      const [res] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO complaints
         (ticket, full_name, email, phone, order_code, topic, subject, message, contact_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticket, full_name, email, phone, order_code || null, topic, subject, message, contact_by]
      );
      complaintId = res.insertId;

      // 2) Lưu files (nếu có)
      const baseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
      const uploadRoot = path.join(process.cwd(), "public", "uploads", "complaints", ticket);
      await ensureDir(uploadRoot);

      const inFiles = form.getAll("attachments") as File[];
      const saved: { file_name: string; file_url: string; mime_type: string; size_bytes: number }[] = [];

      for (const file of inFiles) {
        const name = String((file as any).name || "file");
        const mime = file.type || "application/octet-stream";
        const size = file.size || 0;
        if (!isAllowed(mime, name) || size > 3 * 1024 * 1024) continue;

        const ext = path.extname(name) || "";
        const rnd = crypto.randomBytes(5).toString("hex");
        const finalName = safeFileName(path.basename(name, ext)) + "_" + rnd + ext.toLowerCase();

        const buf = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(path.join(uploadRoot, finalName), buf);

        const url = `${baseUrl}/uploads/complaints/${ticket}/${finalName}`;
        saved.push({ file_name: finalName, file_url: url, mime_type: mime, size_bytes: size });
      }

      if (saved.length) {
        const values = saved.map(() => "(?,?,?,?,?)").join(",");
        const params = saved.flatMap((s) => [complaintId, s.file_name, s.file_url, s.mime_type, s.size_bytes]);
        await conn.execute(
          `INSERT INTO complaint_files (complaint_id, file_name, file_url, mime_type, size_bytes)
           VALUES ${values}`,
          params
        );
      }

      conn.release();

      // 3) Gửi mail (kiểm tra config trước)
      const host = (process.env.SMTP_HOST || "").trim();
      const port = Number(process.env.SMTP_PORT || 465);
      const secure = port === 465; // 465 = SSL/TLS, 587 = STARTTLS
      const user = (process.env.SMTP_USER || "").trim();
      const pass = (process.env.SMTP_PASS || "").trim();
      const from = process.env.MAIL_FROM || `Time Watch <${user || "no-reply@example.com"}>`;
      const toAdmin = process.env.COMPLAINT_NOTIFY_TO || user;

      if (!host || !user || !pass) {
        console.error("SMTP config missing:", { host, user: !!user, pass: !!pass });
        return NextResponse.json(
          { ok: true, ticket, email: false, message: "Đã lưu hồ sơ nhưng thiếu cấu hình SMTP." },
          { status: 200 }
        );
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      try {
        // xác thực SMTP
        await transporter.verify();
      } catch (err) {
        console.error("SMTP verify failed:", err);
        return NextResponse.json(
          { ok: true, ticket, email: false, message: "Đã lưu hồ sơ nhưng không thể kết nối SMTP." },
          { status: 200 }
        );
      }

      const adminHTML = complaintMailHTML({
        ticket,
        full_name,
        email,
        phone,
        order_code,
        topic,
        subject,
        message,
        attachments: [], // nếu muốn show link file cho admin: truyền 'saved'
        toAdmin: true,
      });

      const userHTML = complaintMailHTML({
        ticket,
        full_name,
        email,
        phone,
        order_code,
        topic,
        subject,
        message,
        attachments: [],
      });

      await Promise.all([
        transporter.sendMail({
          from,
          to: toAdmin,
          cc: process.env.COMPLAINT_NOTIFY_CC || undefined,
          subject: `[KHIẾU NẠI] ${ticket} • ${subject}`,
          html: adminHTML,
        }),
        transporter.sendMail({
          from,
          to: email,
          subject: `Time Watch đã tiếp nhận khiếu nại • ${ticket}`,
          html: userHTML,
        }),
      ]);

      return NextResponse.json({ ok: true, ticket, email: true });
    } catch (e) {
      try { conn.release(); } catch {}
      throw e;
    }
  } catch (e) {
    console.error("POST /api/khieu-nai error:", e);
    return NextResponse.json({ ok: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
