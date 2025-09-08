import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Thiếu email." }, { status: 400 });
    }

    const pool = getPool();
    const [rows]: any = await pool.execute(
      `SELECT id, order_code, order_date, status, total_amount, payment_method, shipping_address
       FROM orders
       WHERE receiver_email = ?
       ORDER BY order_date DESC`,
      [email]
    );

    return NextResponse.json({ orders: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Lỗi truy vấn." }, { status: 500 });
  }
}
