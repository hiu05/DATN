"use client";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ThanhMenu from "./components/ThanhMenu";
import { Inter } from "next/font/google";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <title>Trang web đồng hồ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
      </head>
      <body className="bg-gray-100 font-sans text-base text-gray-800">
        <Provider store={store}>
          {/* ✅ Navbar cố định full màn hình */}
          <nav className="fixed top-0 left-0 w-full z-50 bg-gray-100 shadow-md h-[65px]">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between h-full px-4">
              <ThanhMenu />
            </div>
          </nav>

          {/* ✅ Đệm để tránh bị đè bởi menu */}
          <div className="pt-[60px]">
            {/* ✅ Banner full màn hình */}
            <div className="w-full bg-white shadow-sm">
              <Header />
            </div>

            {/* ✅ Nội dung chính */}
            <main className="max-w-screen-xl mx-auto bg-white rounded-md shadow-inner p-6 my-6 w-11/12">
              {children}
            </main>

            {/*  Footer */}
             <footer/> 
              <div className="w-full bg-stone-900 text-white text-center py-1 shadow-md mt-10">
              </div>
            <Footer />
              </div>
        </Provider>
      </body>
    </html>
  );
}
