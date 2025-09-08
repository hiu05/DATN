"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const toSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type Brand = { id: number; name: string };


function isValidImageUrl(url: string) {
  try {
    const u = new URL(url.trim());
    // Cho phép http/https, và có thể không cần đuôi .jpg (CDN có query)
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function normalizeUrl(u: string) {
  return u.trim();
}

function handleAddImageUrl() {
  const raw = imgUrl;
  const u = normalizeUrl(raw);
  if (!u) return;
  if (!isValidImageUrl(u)) {
    setUrlErr("URL không hợp lệ. Hãy dùng http(s)://...");
    return;
  }
  if (images.includes(u)) {
    setUrlErr("Ảnh này đã có trong danh sách.");
    return;
  }
  const next = [...images, u];
  setImages(next);
  if (!mainImage) setMainImage(u);
  setImgUrl("");
  setUrlErr("");
}
export default function AddProductPage() {
  const router = useRouter();

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [price, setPrice] = useState<string>("");
  const [discountPrice, setDiscountPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [movementType, setMovementType] = useState("");
  const [strapMaterial, setStrapMaterial] = useState("");
  const [crystal, setCrystal] = useState("");
  const [waterResistance, setWaterResistance] = useState("");
  const [stockQty, setStockQty] = useState<string>("0");
  const [status, setStatus] = useState<0 | 1>(1);
  const [sortOrder, setSortOrder] = useState<string>("0");
  const [hot, setHot] = useState<0 | 1>(0);
  const [imgUrl, setImgUrl] = useState("");
const [urlErr, setUrlErr] = useState("");
  // images
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>("");

  // misc
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  // load brands
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/brands", { cache: "no-store" });
      setBrands(await r.json());
    })();
  }, []);

  // auto slug
  useEffect(() => setSlug(toSlug(name)), [name]);

  const validMsg = useMemo(() => {
    if (!name.trim()) return "Vui lòng nhập tên sản phẩm";
    if (!brandId) return "Vui lòng chọn thương hiệu";
    const p = Number(price || 0);
    if (!Number.isFinite(p) || p <= 0) return "Giá phải lớn hơn 0";
    if (images.length === 0) return "Vui lòng tải lên ít nhất 1 ảnh";
    return "";
  }, [name, brandId, price, images]);

  async function handlePickFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const paths: string[] = [];
    for (const f of Array.from(list)) {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (j?.filePath) paths.push(j.filePath);
      if (j?.filePaths) paths.push(...j.filePaths); // phòng khi API trả mảng
    }
    const next = [...images, ...paths];
    setImages(next);
    if (!mainImage && next[0]) setMainImage(next[0]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validMsg;
    if (msg) return setError(msg);
    setError("");
    setSaving(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("slug", slug);
    fd.append("brand_id", String(brandId));
    fd.append("price", String(Number(price)));
    fd.append("discount_price", String(Number(discountPrice || 0)));
    fd.append("description", description);
    fd.append("gender", gender);
    fd.append("movement_type", movementType);
    fd.append("strap_material", strapMaterial);
    fd.append("crystal", crystal);
    fd.append("water_resistance", waterResistance);
    fd.append("stock_quantity", String(Number(stockQty || 0)));
    fd.append("status", String(status));
    fd.append("sort_order", String(Number(sortOrder || 0)));
    fd.append("hot", String(hot));
    images.forEach((u) => fd.append("images", u));
    if (mainImage) fd.append("main_image", mainImage);

    const res = await fetch("/api/products", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) {
      alert("✅ Đã thêm sản phẩm");
      router.push("/products");
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Không thể tạo sản phẩm");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5">Thêm sản phẩm</h1>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Tên sản phẩm</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Skagen Signatur SKW6509"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Slug</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Thương hiệu</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={brandId}
              onChange={(e) => setBrandId(Number(e.target.value))}
              required
            >
              <option value="">-- Chọn brand --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Giá (VNĐ)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Giá giảm</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Mô tả</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[110px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn…"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputWrap label="Giới tính">
              <input className="w-full border rounded px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)} />
            </InputWrap>
            <InputWrap label="Bộ máy">
              <input className="w-full border rounded px-3 py-2" value={movementType} onChange={(e) => setMovementType(e.target.value)} />
            </InputWrap>
            <InputWrap label="Dây">
              <input className="w-full border rounded px-3 py-2" value={strapMaterial} onChange={(e) => setStrapMaterial(e.target.value)} />
            </InputWrap>
            <InputWrap label="Kính">
              <input className="w-full border rounded px-3 py-2" value={crystal} onChange={(e) => setCrystal(e.target.value)} />
            </InputWrap>
            <InputWrap label="Chống nước">
              <input className="w-full border rounded px-3 py-2" value={waterResistance} onChange={(e) => setWaterResistance(e.target.value)} />
            </InputWrap>
            <InputWrap label="Số lượng tồn">
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                min={0}
              />
            </InputWrap>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputWrap label="Trạng thái">
              <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(Number(e.target.value) as 0 | 1)}>
                <option value={1}>Hiện</option>
                <option value={0}>Ẩn</option>
              </select>
            </InputWrap>
            <InputWrap label="Thứ tự">
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                min={0}
              />
            </InputWrap>
            <InputWrap label="Hot">
              <select className="w-full border rounded px-3 py-2" value={hot} onChange={(e) => setHot(Number(e.target.value) as 0 | 1)}>
                <option value={0}>Không</option>
                <option value={1}>Có</option>
              </select>
            </InputWrap>
          </div>

          {/* IMAGES */}
          <div
  onPaste={(e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      handlePickFiles(files);
    }
  }}
>
  <label className="block mb-2 font-semibold">Hình ảnh</label>

  {/* --- Upload file --- */}
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => handlePickFiles(e.target.files)}
  />

  {urlErr && <p className="text-sm text-red-600 mt-1">{urlErr}</p>}

  {images.length > 0 && (
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
  )}

  {mainImage && (
    <p className="text-sm text-gray-600 mt-2">
      Ảnh chính: <span className="font-medium">{mainImage}</span>
    </p>
  )}
</div>

        </div>

        {/* FOOTER */}
        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex gap-3">
            <button type="button" className="px-4 py-2 rounded border" onClick={() => router.back()}>
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {saving ? "Đang lưu…" : "Lưu sản phẩm"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
export function InputWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}
