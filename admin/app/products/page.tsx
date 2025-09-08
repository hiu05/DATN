import { IProduct } from "../lib/cautrucdata";
import { IProductImage } from "../lib/cautrucdata";
import Link from "next/link";
import ProductRow from "./ProductRow";

export default async function ProductList({ searchParams }: string) {
    const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const data = await fetch(`${process.env.APP_URL}/api/products?limit=${limit}&offset=${offset}`, { cache: "no-store" });
    const sp_arr: IProduct[] = await data.json() as IProduct[];
    console.log("🚀 Sản phẩm:", sp_arr);


    return (
        <div className="max-w-6xl mx-auto p-8 bg-white min-h-[80vh] rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
                    Danh sách sản phẩm
                </h1>
                <Link
                    href="/products/them"
                    className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    + Thêm sản phẩm
                </Link>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="max-h-[70vh] overflow-auto">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 shadow">
                            <tr>
                                <th className="p-3 border-b text-center">ID</th>
                                <th className="p-3 border-b text-left">Tên</th>
                                <th className="p-3 border-b text-left">Brand</th>
                                <th className="p-3 border-b text-right">Giá</th>
                                <th className="p-3 border-b text-right">Giá giảm</th>
                                <th className="p-3 border-b text-center">Ảnh</th>
                                <th className="p-3 border-b text-center">Ngày</th>
                                <th className="p-3 border-b text-center">Trạng thái</th>
                                <th className="p-3 border-b text-center">Hot</th>
                                <th className="p-3 border-b text-center">Thuộc tính</th>
                                <th className="p-3 border-b text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sp_arr.map((sp) => (
                                <ProductRow key={sp.id} sp={sp} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex justify-center mt-10 gap-2">
                <Link
                    href={`?page=${page - 1}`}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${page <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    aria-disabled={page <= 1}
                    tabIndex={page <= 1 ? -1 : 0}
                >
                    ← Trước
                </Link>
                <span className="px-4 py-2 font-bold text-blue-700 bg-blue-100 rounded-lg">Trang {page}</span>
                <Link
                    href={`?page=${page + 1}`}
                    className="px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150"
                >
                    Sau →
                </Link>
            </div>
        </div>
    );
}
