    "use client";

import { useState } from "react";
import { toSlug } from "@/app/lib/aboutstring";
import { IBrand } from "@/app/lib/cautrucdata";
import UploadImage from "@/app/component/UploadImage";

export default function BrandForm({ brand }: { brand: IBrand }) {
  const [name, setName] = useState(brand.name);
  const [slug, setSlug] = useState(brand.slug);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug(toSlug(value)); // tự sinh slug từ name
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-8">
            <h1 className="text-2xl font-semibold mb-6 text-blue-600 border-b pb-2">Sửa hãng</h1>
    <form className="space-y-4" action={`/api/brands/${brand.slug}`} method="POST">
      <div>
        <label className="block font-medium mb-1" htmlFor="name">Tên hãng</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={handleNameChange}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="slug">Slug</label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={slug}
          readOnly
          className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-gray-500"
        />
      </div>
        <div>
            <label className="block font-medium mb-1" htmlFor="logo_url">Logo URL</label>
            <UploadImage name="logo_url" />
            <input type="hidden" name="logo_url" value={brand.logo_url} />
        </div>
        <div>
            <label className="block font-medium mb-1" htmlFor="sort_order">Thứ tự</label>
            <input
                type="number"
                id="sort_order"
                name="sort_order"
                defaultValue={brand.sort_order}
                min={1}
                className="border border-gray-300 rounded px-3 py-2 w-full"
            />
        </div>
        <div>
            <span className="block font-medium mb-1">Ẩn/Hiện</span>
            <label className="inline-flex items-center mr-6">
                <input
                    type="radio"
                    name="status"
                    value="1"
                    defaultChecked={brand.status=== 1}
                    className="form-radio text-blue-400"
                />
                <span className="ml-2">Hiện</span>
            </label>
            <label className="inline-flex items-center">
                <input
                    type="radio"
                    name="status"
                    value="0"
                    defaultChecked={!brand.status}
                    className="form-radio text-blue-400"
                />
                <span className="ml-2">Ẩn</span>
            </label>
        </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Lưu thay đổi
      </button>

    </form>
    </div>
  );
}
