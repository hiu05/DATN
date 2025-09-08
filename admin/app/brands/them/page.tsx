"use client";
import { useState } from "react";
import { createHandleNameChange } from "@/app/lib/aboutstring";
import UploadImage  from "@/app/component/UploadImage";
export default function ThemBrand() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const handleNameChange = createHandleNameChange(setName, setSlug);
    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-md rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-6 text-center bg-blue-300 py-3 rounded">Thêm hãng mới</h1>
            <form action="/api/brands" method="POST" className="space-y-5">
                <div>
                    <label className="block font-medium mb-1" htmlFor="name">Tên hãng</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={name}
                        onChange={handleNameChange}
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                        tabIndex={-1}
                        className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-default select-none"
                        style={{ pointerEvents: "none" }}
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="logo_url">Logo URL</label>
                    <UploadImage name="logo_url" />
                    <input type="hidden" name="logo_url" /> {/* Ảnh sẽ lưu vào đây */}
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="sort_order">Thứ tự</label>
                    <input
                        type="number"
                        id="sort_order"
                        name="sort_order"
                        defaultValue={1}
                        min={1}
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <span className="block font-medium mb-1">Ẩn/Hiện</span>
                    <label className="inline-flex items-center mr-6">
                        <input
                            type="radio"
                            name="status"
                            value="1"
                            defaultChecked
                            className="form-radio text-blue-400"
                        />
                        <span className="ml-2">Hiện</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="status"
                            value="0"
                            className="form-radio text-blue-400"
                        />
                        <span className="ml-2">Ẩn</span>
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
                >
                    Thêm hãng
                </button>
            </form>
        </div>
    )
}