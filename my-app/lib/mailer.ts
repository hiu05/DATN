import nodemailer from "nodemailer";

export function getTransporter() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function buildOrderEmailHTML({
  full_name,
  order_code,
  total,
  address,
  payment_label,
  items,
}: {
  full_name: string;
  order_code: string;
  total: number;
  address: string;
  payment_label: string;
  items: Array<{ name: string; qty: number; price: number; subtotal: number }>;
}) {
  const rows = items.map(
    (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${it.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${it.price.toLocaleString()} ₫</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right"><b>${it.subtotal.toLocaleString()} ₫</b></td>
      </tr>`
  ).join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#222">
    <h2 style="color:#f97316;margin-bottom:4px">TimeWatch – Xác nhận đơn hàng</h2>
    <p>Chào <b>${full_name}</b>, cảm ơn bạn đã đặt hàng tại TimeWatch.</p>
    <p>Mã đơn hàng của bạn: <b style="font-size:16px">${order_code}</b></p>

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
          <td style="padding:8px;text-align:right"><b style="font-size:16px">${total.toLocaleString()} ₫</b></td>
        </tr>
      </tfoot>
    </table>

    <p><b>Địa chỉ nhận hàng:</b> ${address}</p>
    <p><b>Phương thức thanh toán:</b> ${payment_label}</p>

    <div style="margin-top:16px">
      <a href="${process.env.APP_BASE_URL || "http://localhost:3000"}/don-hang?email={{EMAIL}}"
         style="display:inline-block;background:#f97316;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
        Xem lịch sử đơn hàng
      </a>
    </div>

    <p style="color:#666;margin-top:24px">Nếu bạn cần hỗ trợ, hãy trả lời email này hoặc liên hệ fanpage/Hotline của chúng tôi.</p>
  </div>`;
}
