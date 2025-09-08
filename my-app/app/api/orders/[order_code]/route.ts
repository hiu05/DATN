import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { order_code: string } }) {
  try {
    const order_code =  params.order_code;


    const pool = getPool();
    const [rows]: any = await pool.execute(
      `SELECT id, order_code, order_date, status, total_amount, payment_method, shipping_address
       FROM orders
       WHERE order_code = ?
       ORDER BY order_date DESC`,
      [order_code]
    );

    return NextResponse.json({ orders: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Lỗi truy vấn." }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ order_code: string }> }) {
  const order_code = await context.params.then(p => p.order_code);
  let { payment_method } = await req.json(); // lấy phương thức thanh toán từ client
  if ( payment_method !== "stripe" ) {
    payment_method = "Thanh toán khi nhận hàng"; 
   }
  const status = 'Đang xử lý'; // Mặc định chuyển sang trạng thái "Đang xử lý"
  try {
    const pool = getPool();
    const [result]: any = await pool.execute(
      `UPDATE orders SET status = ?, payment_method = ? WHERE order_code = ?`,
      [status,payment_method, order_code]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    return NextResponse.json({ message: "Cập nhật trạng thái thành công." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Lỗi cập nhật." }, { status: 500 });
  }
  
}