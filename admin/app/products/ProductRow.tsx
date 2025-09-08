"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NutXoaSP from "./NutXoaSP";
export default function ProductRow({ sp }: { sp: any }) {
  const [open, setOpen] = useState(false);

  const main = sp.images?.find((x: any) => x.is_main === 1) || sp.images?.[0];

  return (
    <>
      {/* Hàng chính */}
      <tr className="border-b hover:bg-blue-50 transition-colors">
        <td className="p-3 text-center font-medium">{sp.id}</td>
        <td className="p-3 w-1/5 font-semibold truncate" title={sp.name}>{sp.name}</td>
        <td className="p-3 font-semibold">{sp.brand?.name || <span className="italic text-gray-400">Không rõ</span>}</td>
        <td className="p-3 text-right font-mono">
          {Number(sp.price).toLocaleString("vi")} <span className="text-xs text-gray-400">VNĐ</span>
        </td>
        <td className="p-3 text-right font-mono">
          {Number(sp.discount_price).toLocaleString("vi")} <span className="text-xs text-gray-400">VNĐ</span>
        </td>
        <td className="p-3 text-center">
          {main ? (
            <img src={main.image_url} width="50" className="inline-block rounded border shadow-sm bg-white" alt={sp.name} />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="p-3 text-center font-mono text-xs text-gray-600">
          {new Date(sp.created_at).toLocaleDateString("vi", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </td>
        <td className="p-3 text-center">
          {sp.status ? <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Hiện</span>
                     : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Ẩn</span>}
        </td>
        <td className="p-3 text-center">
          {sp.hot ? <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-600">Hot</span>
                  : <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500">Normal</span>}
        </td>
        <td className="p-3 text-center">
          <button
            onClick={() => setOpen(v => !v)}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
          >
            {open ? "Ẩn thuộc tính" : "Thuộc tính"}
          </button>
        </td>
        <td className="p-3 text-center">
          <Link href={`/products/${sp.slug}`} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-green-700 text-xs mr-2">
            Sửa
          </Link>
          <NutXoaSP id={sp.id} name={sp.name} />
        </td>
      </tr>

      {/* Hàng chi tiết – xổ dưới */}
      {open && (
        <tr className="bg-white">
          <td colSpan={10} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột 1: Thuộc tính kỹ thuật */}
              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3 text-blue-700">Thông số</h4>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-slate-500">Giới tính</dt><dd className="font-medium">{sp.gender || "—"}</dd>
                  <dt className="text-slate-500">Bộ máy</dt><dd className="font-medium">{sp.movement_type || "—"}</dd>
                  <dt className="text-slate-500">Dây</dt><dd className="font-medium">{sp.strap_material || "—"}</dd>
                  <dt className="text-slate-500">Kính</dt><dd className="font-medium">{sp.crystal || "—"}</dd>
                  <dt className="text-slate-500">Chống nước</dt><dd className="font-medium">{sp.water_resistance || "—"}</dd>
                  <dt className="text-slate-500">Tồn kho</dt><dd className="font-medium">{sp.stock_quantity ?? "—"}</dd>
                  <dt className="text-slate-500">Thứ tự</dt><dd className="font-medium">{sp.sort_order ?? 0}</dd>
                  <dt className="text-slate-500">Lượt xem</dt><dd className="font-medium">{sp.view ?? 0}</dd>
                </dl>
              </div>

              {/* Cột 2: Mô tả */}
              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3 text-blue-700">Mô tả</h4>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {sp.description || "—"}
                </p>
              </div>

              {/* Cột 3: Ảnh phụ xổ dọc */}
              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3 text-blue-700">Hình ảnh</h4>
                {sp.images?.length ? (
                  <div className="flex flex-col items-start gap-2 max-h-72 overflow-auto pr-1">
                    {sp.images.map((img: any) => (
                      <div key={img.id} className="flex items-center gap-2">
                        <img
                          src={img.image_url}
                          alt={sp.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        {img.is_main ? <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Ảnh chính</span> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-500">Chưa có ảnh</span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
