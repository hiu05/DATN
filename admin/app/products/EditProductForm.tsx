"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "../lib/cautrucdata";
import { toSlug } from "../lib/aboutstring";
type Brand = { id: number; name: string };

export default function ProductForm({
  initial = {} as IProduct,
  submitTo,
  brands,
  method = "POST",
  redirectTo = "/products",
}: {
  initial?: IProduct[]; // Dữ liệu sản phẩm ban đầu (sửa)
  submitTo: string;          // /api/products  (POST)  hoặc /api/products/[slug] (PUT)
  brands: Brand[];
  method?: "POST" | "PUT";
  redirectTo?: string;
}) {
  const router = useRouter();

  // ===== state =====
  const [name, setName] = useState(initial.name || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [brandId, setBrandId] = useState<number | "">(initial.brand['id'] ?? "");
  const [brandName, setBrandName] = useState(initial.brand['name'] || ""); // Tên thương hiệu, có thể không cần nếu không dùng
  const [price, setPrice] = useState<string>(String(initial.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState<string>(String(initial.discount_price ?? ""));
  const [description, setDescription] = useState(initial.description || "");
  const [gender, setGender] = useState(initial.gender || "");
  const [movementType, setMovementType] = useState(initial.movement_type || "");
  const [strapMaterial, setStrapMaterial] = useState(initial.strap_material || "");
  const [crystal, setCrystal] = useState(initial.crystal || "");
  const [waterResistance, setWaterResistance] = useState(initial.water_resistance || "");
  const [stockQty, setStockQty] = useState<string>(String(initial.stock_quantity ?? "0"));
  const [status, setStatus] = useState<0 | 1>(initial.status ?? 1);
  const [sortOrder, setSortOrder] = useState<string>(String(initial.sort_order ?? "0"));
  const [hot, setHot] = useState<0 | 1>(initial.hot ?? 0);

  // Ảnh
  const seedImages = (initial.images || []).map((x) => x.image_url);
  const [images, setImages] = useState<string[]>(seedImages);
  const [mainImage, setMainImage] = useState<string>(
    initial.images?.find((x) => x.is_main === 1)?.image_url || seedImages[0] || ""
  );

  // Misc
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // auto-slug
  useEffect(() => setSlug((s) => (s ? s : toSlug(name))), [name]);

  const validMsg = useMemo(() => {
    if (!name.trim()) return "Vui lòng nhập tên sản phẩm";
    if (!brandId) return "Vui lòng chọn thương hiệu";
    if (!Number(price)) return "Giá phải lớn hơn 0";
    if (images.length === 0) return "Vui lòng tải lên ít nhất 1 ảnh";
    return "";
  }, [name, brandId, price, images]);

  async function uploadMany(list: FileList | null) {
    if (!list || list.length === 0) return;
    const added: string[] = [];
    for (const f of Array.from(list)) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (j?.filePath) added.push(j.filePath);
      if (j?.filePaths) added.push(...j.filePaths);
    }
    const next = [...images, ...added];
    setImages(next);
    if (!mainImage && next[0]) setMainImage(next[0]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validMsg;
    if (msg) return setError(msg);
    setError("");
    setSaving(true);

    // Gửi JSON cho gọn (API PUT/POST đều đọc được)
    const body = {
      name,
      slug,
      brand_id: Number(brandId),
      price: Number(price),
      discount_price: Number(discountPrice || 0),
      description,
      gender,
      movement_type: movementType,
      strap_material: strapMaterial,
      crystal,
      water_resistance: waterResistance,
      stock_quantity: Number(stockQty || 0),
      status,
      sort_order: Number(sortOrder || 0),
      hot,
      images,
      main_image: mainImage || images[0] || "",
    };

    const res = await fetch(submitTo, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      router.push(redirectTo);
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Không thể lưu sản phẩm");
    }
  }
  console.log("ProductForm render", initial)
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow border p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold">Thông tin sản phẩm</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => history.back()} className="px-4 py-2 border rounded">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2 rounded text-white ${
              saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid 2 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái */}
        <section className="space-y-4">
          <Field label="Tên sản phẩm">
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Skagen Signatur SKW6509"
              required
            />
          </Field>

          <Field label="Slug">
            <input
              className="w-full border rounded px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              required
            />
          </Field>

          <Field label="Thương hiệu">
            <select
              className="w-full border rounded px-3 py-2"
              value={brandId}
              onChange={(e) => setBrandId(Number(e.target.value))}
              required
            >
              <option value="">Chọn hãng</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá (VNĐ)">
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                required
              />
            </Field>
            <Field label="Giá giảm">
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                min={0}
              />
            </Field>
          </div>

          <Field label="Mô tả">
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[110px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn…"
            />
          </Field>
        </section>

        {/* Cột phải */}
        <section className="space-y-4">
          <Card title="Thuộc tính">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Giới tính">
                <input className="w-full border rounded px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)} />
              </Field>
              <Field label="Bộ máy">
                <input className="w-full border rounded px-3 py-2" value={movementType} onChange={(e) => setMovementType(e.target.value)} />
              </Field>
              <Field label="Dây">
                <input className="w-full border rounded px-3 py-2" value={strapMaterial} onChange={(e) => setStrapMaterial(e.target.value)} />
              </Field>
              <Field label="Kính">
                <input className="w-full border rounded px-3 py-2" value={crystal} onChange={(e) => setCrystal(e.target.value)} />
              </Field>
              <Field label="Chống nước">
                <input className="w-full border rounded px-3 py-2" value={waterResistance} onChange={(e) => setWaterResistance(e.target.value)} />
              </Field>
              <Field label="Tồn kho">
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  min={0}
                />
              </Field>
              <Field label="Trạng thái">
                <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(Number(e.target.value) as 0 | 1)}>
                  <option value={1}>Hiện</option>
                  <option value={0}>Ẩn</option>
                </select>
              </Field>
              <Field label="Thứ tự">
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  min={0}
                />
              </Field>
              <Field label="Hot">
                <select className="w-full border rounded px-3 py-2" value={hot} onChange={(e) => setHot(Number(e.target.value) as 0 | 1)}>
                  <option value={0}>Không</option>
                  <option value={1}>Có</option>
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Hình ảnh">
            <input type="file" multiple accept="image/*" onChange={(e) => uploadMany(e.target.files)} />
            {images.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((u) => (
                  <figure key={u} className="relative">
                    <img src={u} className="w-full h-24 object-cover rounded border" alt="preview" />
                    <input
                      type="radio"
                      name="main"
                      checked={mainImage === u}
                      onChange={() => setMainImage(u)}
                      className="absolute top-1 left-1 w-4 h-4 accent-blue-600"
                      title="Ảnh chính"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = images.filter((x) => x !== u);
                        setImages(next);
                        if (mainImage === u) setMainImage(next[0] || "");
                      }}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-xs px-1 rounded border"
                      title="Xoá"
                    >
                      ✕
                    </button>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-2">Chưa có ảnh</p>
            )}
            {mainImage && <p className="text-sm text-gray-600 mt-2">Ảnh chính: <b>{mainImage}</b></p>}
          </Card>
        </section>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold text-blue-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
