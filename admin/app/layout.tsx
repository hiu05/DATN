import React from "react";
import Link from "next/link";
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="m-0 font-sans bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
        <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-8 py-5 shadow-md flex items-center justify-between sticky top-0 z-50">
          <h1 className="text-2xl font-extrabold tracking-wide drop-shadow">Admin Dashboard</h1>
          <span className="text-sm font-medium opacity-80">Xin chào, Admin</span>
        </header>
        <div className="flex min-h-screen ">
          <aside className="w-64 bg-white border-r border-gray-200 py-10 px-6 shadow-lg flex flex-col gap-8 sticky top-0 h-screen">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Bảng diều khiển
                  </Link>
                </li>
                <li>
                  <Link href="/banners" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý quảng cáo
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý hãng
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý sản phẩm
                  </Link>
                </li>
                <li>
                  <Link href="/users" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý tài khoản
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý đơn hàng
                  </Link>
                </li>
                <li>
                  <Link href="/posts" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý tin tức
                  </Link>
                </li>
                <li>
                  <Link href="/comments" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý bình luận
                  </Link>
                </li>
                <li>
                  <Link href="/coupons" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Quản lý mã giảm giá
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" className="block px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:text-blue-900 transition-all duration-150">
                    Cài đặt hệ thống
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1 p-10 bg-transparent min-h-screen">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
