import Link from "next/link";
import { IBrand } from "../lib/cautrucdata";
import NutXoaBrand from "../component/nutxoabrand";
import Image from "next/image";
interface IBrandWithCount extends IBrand {
    so_luong?: number;
}

interface PageProps {
    searchParams?: { page?: string };
}

export default async function BrandList({ searchParams }: PageProps) {
    const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const data = await fetch(`${process.env.APP_URL}/api/brands?limit=${limit}&offset=${offset}`);
    const brand_arr: IBrandWithCount[] = await data.json() as IBrandWithCount[];
    console.log("Brand data:", brand_arr);
    
    return (
        <div className="max-w-5xl mx-auto p-8 bg-white min-h-[70vh] rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
                    Danh sách hãng
                </h1>
                <Link href="/brands/them" className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    + Thêm hãng
                </Link>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
                <table className="min-w-full text-sm text-gray-700">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900">
                            <th className="p-3 border-b font-semibold text-center">ID</th>
                            <th className="p-3 border-b font-semibold text-left">Tên hãng</th>
                            <th className="p-3 border-b font-semibold text-left">Logo</th>
                            <th className="p-3 border-b font-semibold text-center">Thứ tự</th>
                            <th className="p-3 border-b font-semibold text-center">Ẩn hiện</th>
                            <th className="p-3 border-b font-semibold text-center">Số SP</th>
                            <th className="p-3 border-b font-semibold text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brand_arr.map((brand) =>
                            <tr key={brand.id} className="border-b hover:bg-blue-50 transition-colors group">
                                <td className="p-3 text-center font-medium">{brand.id}</td>
                                <td className="p-3 font-semibold">{brand.name}</td>
                                <td className="p-3 text-center">
                                    <Image 
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    width={50}
                                    height={50}>
                                        </Image></td>
                               <td className="p-3 text-center font-mono">{brand.sort_order}</td>
                                <td className="p-3 text-center">
                                    {brand.status ? (
                                        <span className="inline-block text-green-600 text-lg">✅</span>
                                    ) : (
                                        <span className="inline-block text-red-400 text-lg">❌</span>
                                    )}
                                </td>
                                <td className="p-3 text-center font-bold text-blue-700">{brand.so_luong ?? 0}</td>
                                <td className="p-3 text-center space-x-2">
                                    <Link href={`/brands/${brand.slug}`} className="text-blue-600 hover:underline font-semibold mx-2 transition-colors">Sửa</Link>
                                    <span className="text-gray-400 mx-1">|</span>
                                    <NutXoaBrand slug={brand.slug} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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