// app/orders/them/page.tsx
import OrderForm from "../OrderForm";

export const dynamic = "force-dynamic";

async function fetchLite(path: string) {
  const base = process.env.APP_URL || "";
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export default async function AddOrderPage() {
  // gọi API lấy user & product
  const [users, products] = await Promise.all([
    fetchLite("/api/users?limit=1000&offset=0"),
    fetchLite("/api/products?limit=1000&offset=0"),
  ]);

  // rút gọn product cho form
  const plite = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.discount_price ?? p.price ?? 0),
  }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <OrderForm users={users || []} products={plite} mode="create" />
    </div>
  );
}
