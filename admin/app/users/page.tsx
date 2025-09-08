// app/users/page.tsx
import { IUser } from "@/app/lib/cautrucdata"; // đổi path đúng chỗ bạn lưu
import Link from "next/link";

export default async function UsersPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  // gọi API users với limit/offset
  const res = await fetch(`${process.env.APP_URL}/api/user?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  if (!res.ok) {
    return <div className="p-6 text-red-600">Không tải được danh sách users.</div>;
  }
  const users: IUser[] = await res.json();
    console.log("🚀 Danh sách người dùng:", users);
  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow border">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl md:text-2xl px-4 py-2 text-blue-700 font-extrabold tracking-wide uppercase bg-blue-100 rounded shadow-sm">
                    Danh sách tài khoản
                </h1>
                <Link href="/users/them" className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    + Thêm tài khoản
                </Link>
            </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 shadow">
            <tr>
              <th className="p-3 border-b">ID</th>
              <th className="p-3 border-b text-left">Họ tên</th>
              <th className="p-3 border-b text-left">Email</th>
              <th className="p-3 border-b text-left">Phone</th>
              <th className="p-3 border-b text-left">Vai trò</th>
              <th className="p-3 border-b text-center">Trạng thái</th>
              <th className="p-3 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-500">Không có dữ liệu</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-center">{u.id}</td>
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3">{u.email || "—"}</td>
                  <td className="p-3">{u.phone || "—"}</td>
                  <td className="p-3">{(u as any).role || "user"}</td>
                  <td className="p-3 text-center">
                    {(u as any).status ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Hiện</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Ẩn</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Link href={`/users/${u.id}`} className="text-blue-600 hover:underline">Sửa</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* phân trang đơn giản */}
      <div className="flex justify-center mt-8 gap-2">
        <Link
          href={`?page=${page - 1}`}
          className={`px-4 py-2 rounded ${page <= 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : 0}
        >
          ← Trước
        </Link>
        <span className="px-4 py-2 font-semibold text-blue-700 bg-blue-100 rounded">Trang {page}</span>
        <Link
          href={`?page=${page + 1}`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Sau →
        </Link>
      </div>
    </div>
  );
}
