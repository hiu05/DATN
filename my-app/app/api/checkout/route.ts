
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
export const runtime = "nodejs";
// Tuỳ chọn (tránh cache khi deploy): 
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
      queueLimit: 0,
      charset: "utf8mb4_general_ci",
    });
  }
  return pool;
}

/**
 * Body dự kiến FE gửi lên:
 * {
 *   full_name: string,
 *   address: string,
 *   phone: string,
 *   email: string,
 *   note?: string,
 *   order_code: string,           // ví dụ: DH123456
 *   paymentMethod: "cod"|"bank"|"momo"|"vnpay",
 *   items: [{ product_id: number, quantity: number }]
 * }
 */
export async function POST(req: Request) {
  // import nodemailer Ở ĐÂY (chỉ trong server file) => tránh bị kéo vào client
  const nodemailer = (await import("nodemailer")).default;

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const body = await req.json();
    const {
      full_name,
      address,
      phone,
      email,
      note,
      order_code,
      paymentMethod,
      items,
    } = body || {};

    if (
      !full_name ||
      !address ||
      !phone ||
      !email ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json({ message: "Thiếu dữ liệu bắt buộc." }, { status: 400 });
    }

    const pmLabel =
      paymentMethod === "bank" ? "Chuyển khoản" :
        paymentMethod === "momo" ? "Momo" :
          paymentMethod === "vnpay" ? "VNPAY" :
            "Thanh toán khi nhận hàng";

    const status =
      paymentMethod === "bank" || paymentMethod === "momo" || paymentMethod === "vnpay"
        ? "Chờ thanh toán"
        : "Chờ xác nhận";

    await conn.beginTransaction();

    // 1) Lấy giá sản phẩm
    type Row = { id: number; name: string; price: number; discount_price: number | null };
    const ids = items.map((i: any) => Number(i.product_id)).filter(Boolean);
    if (ids.length === 0) throw new Error("Danh sách sản phẩm rỗng.");

    const placeholders = ids.map(() => "?").join(",");
    const [prodRows] = await conn.query(
      `SELECT id, name, price, discount_price FROM products WHERE id IN (${placeholders})`,
      ids
    ) as [Row[], any];

    const priceMap = new Map<number, { name: string; price: number }>();
    for (const r of prodRows) {
      const unit =
        r.discount_price && Number(r.discount_price) > 0
          ? Number(r.discount_price)
          : Number(r.price);
      priceMap.set(Number(r.id), { name: r.name, price: unit });
    }

    // 2) Tính tổng & chuẩn bị items
    let total = 0;
    const lineItems: Array<{
      product_id: number;
      quantity: number;
      unit_price: number;
      name: string;
      subtotal: number;
    }> = [];

    for (const it of items) {
      const pid = Number(it.product_id);
      const qty = Math.max(1, Number(it.quantity || 1));
      const info = priceMap.get(pid);
      if (!info) throw new Error(`Không tìm thấy sản phẩm id=${pid}`);
      const subtotal = info.price * qty;
      total += subtotal;
      lineItems.push({
        product_id: pid,
        quantity: qty,
        unit_price: info.price,
        name: info.name,
        subtotal,
      });
    }

    // 3) Tạo orders
    const [resOrder]: any = await conn.execute(
      `INSERT INTO orders
         (user_id, receiver_name, receiver_email, order_code, order_date, status, total_amount, shipping_address, payment_method, note, receiver_phone)
       VALUES
         (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        null,
        full_name,
        email,
        order_code,
        status,
        total,
        address,
        pmLabel,
        note || null,
        phone,
      ]
    );
    const orderId = Number(resOrder.insertId);

    // 4) Tạo order_items + trừ tồn kho
    for (const li of lineItems) {
      // Lưu chi tiết đơn hàng
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)`,
        [orderId, li.product_id, li.quantity, li.unit_price]
      );

      // Lấy tồn kho hiện tại
      const [stockRows]: any = await conn.query(
        `SELECT stock_quantity, name FROM products WHERE id = ? FOR UPDATE`,
        [li.product_id]
      );

      if (stockRows.length === 0) {
        throw new Error(`Sản phẩm với ID ${li.product_id} không tồn tại`);
      }

      const currentStock = Number(stockRows[0].stock_quantity);

      // Kiểm tra đủ hàng hay không
      if (currentStock < li.quantity) {
        throw new Error(`Sản phẩm "${stockRows[0].name}" không đủ tồn kho`);
      }

      // Trừ tồn kho
      await conn.execute(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [li.quantity, li.product_id]
      );

    }


    await conn.commit();

    // 5) Gửi email xác nhận (không để fail đơn nếu mail lỗi)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      const html = buildEmailHtml({
        appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
        full_name,
        order_code,
        total,
        address,
        payment_label: pmLabel,
        email,
        items: lineItems.map(li => ({
          name: li.name,
          qty: li.quantity,
          price: li.unit_price,
          subtotal: li.subtotal,
        })),
      });

      await transporter.sendMail({
        from: `"TimeWatch" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Xác nhận đơn hàng ${order_code} – TimeWatch`,
        html,
      });
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
    }

    return NextResponse.json({
      message: "Đặt hàng thành công.",
      order: {
        id: orderId,
        code: order_code,
        status,
        payment_method: pmLabel,
        total,
        email,
      },
    });
  } catch (err: any) {
    try { await conn.rollback(); } catch { }
    console.error("Checkout error:", err?.message || err);
    return NextResponse.json({ message: "Có lỗi khi đặt hàng." }, { status: 500 });
  } finally {
    conn.release();
  }
}

// ---- helper render HTML email ----
function buildEmailHtml({
  appBaseUrl,
  full_name,
  order_code,
  total,
  address,
  payment_label,
  email,
  items,
}: {
  appBaseUrl: string;
  full_name: string;
  order_code: string;
  total: number;
  address: string;
  payment_label: string;
  email: string;
  items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
}) {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(it.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${toVnd(it.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right"><b>${toVnd(it.subtotal)}</b></td>
      </tr>`
    )
    .join("");

  const historyUrl = `${appBaseUrl}/don-hang?email=${encodeURIComponent(email)}`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
    <h2 style="color:#f97316;margin-bottom:4px">TimeWatch – Xác nhận đơn hàng</h2>
    <p>Chào <b>${escapeHtml(full_name)}</b>, cảm ơn bạn đã đặt hàng tại TimeWatch.</p>
    <p>Mã đơn hàng: <b style="font-size:16px">${escapeHtml(order_code)}</b></p>

    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#fafafa">
          <th align="left" style="padding:8px;border-bottom:1px solid #eee">Sản phẩm</th>
          <th style="padding:8px;border-bottom:1px solid #eee">SL</th>
          <th align="right" style="padding:8px;border-bottom:1px solid #eee">Đơn giá</th>
          <th align="right" style="padding:8px;border-bottom:1px solid #eee">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:8px;text-align:right"><b>Tổng cộng</b></td>
          <td style="padding:8px;text-align:right"><b style="font-size:16px">${toVnd(total)}</b></td>
        </tr>
      </tfoot>
    </table>

    <p><b>Địa chỉ nhận hàng:</b> ${escapeHtml(address)}</p>
    <p><b>Phương thức thanh toán:</b> ${escapeHtml(payment_label)}</p>

    <div style="margin-top:16px">
      <a href="${historyUrl}"
         style="display:inline-block;background:#f97316;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
        Xem lịch sử đơn hàng
      </a>
    </div>

    <p style="color:#666;margin-top:24px">Nếu bạn cần hỗ trợ, hãy trả lời email này hoặc liên hệ fanpage/Hotline của chúng tôi.</p>
  </div>`;
}

function toVnd(n: number) {
  return `${Number(n).toLocaleString("vi-VN")} ₫`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m] as string));
}
