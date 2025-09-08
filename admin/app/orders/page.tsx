// app/orders/page.tsx
import OrdersClient from "./OrdersClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function getBaseURL() {
  const h = headers();
  const host = h.get("host")!;
  const proto = process.env.VERCEL ? "https" : "http";
  return process.env.APP_URL || `${proto}://${host}`;
}

export default async function OrdersPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const res = await fetch(`${getBaseURL()}/api/orders?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return <div className="p-6 text-red-600">Không tải được danh sách đơn hàng.</div>;
  }
  const orders = await res.json();

  return (
   

      <OrdersClient initialOrders={orders} page={page} limit={limit} />

  );
}
