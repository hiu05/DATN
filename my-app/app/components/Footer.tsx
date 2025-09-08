"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

export default function Footer() {
  return (
    <>
      {/* Footer chính */}
      <footer className="bg-[#1c1c1c] text-white text-[15px] font-medium leading-relaxed">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          {/* Cột 1 */}
          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-4">
              VỀ TIMEWATCH
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ve-timewatch/phan-anh"
                  className="hover:text-orange-400"
                >
                  Phản ánh - Khiếu nại
                </Link>
              </li>
              <li>
                <Link
                  href="/ve-timewatch/chung-nhan-dai-ly"
                  className="hover:text-orange-400"
                >
                  Chứng nhận đại lý
                </Link>
              </li>
              <li>
                <Link
                  href="/ve-timewatch/tin-tuc"
                  className="hover:text-orange-400"
                >
                  Tin tức công ty
                </Link>
              </li>
              <li>
                <Link
                  href="/ve-timewatch/top-list"
                  className="hover:text-orange-400"
                >
                  Top list đồng hồ
                </Link>
              </li>
              <li>
                <Link
                  href="/ve-timewatch/kien-thuc"
                  className="hover:text-orange-400"
                >
                  Kiến thức đồng hồ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2 */}
          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-4">
              CHÍNH SÁCH CHUNG
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/chinh-sach/dieu-khoan-thanh-toan"
                  className="hover:text-orange-400"
                >
                  Điều khoản thanh toán
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/bao-hanh"
                  className="hover:text-orange-400"
                >
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/doi-tra"
                  className="hover:text-orange-400"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/bao-mat"
                  className="hover:text-orange-400"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach/van-chuyen"
                  className="hover:text-orange-400"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-4">
              LIÊN HỆ HỖ TRỢ
            </h3>
            <ul className="space-y-2">
              <li>
                Hotline 1:{" "}
                <a href="tel:0931892222" className="hover:text-orange-400">
                  093 189 2222
                </a>
              </li>
              <li>
                Hotline 2:{" "}
                <a href="tel:0971893333" className="hover:text-orange-400">
                  097 189 3333
                </a>
              </li>
              <li>
                Hotline 3:{" "}
                <a href="tel:0961395555" className="hover:text-orange-400">
                  096 139 5555
                </a>
              </li>
            </ul>

            <h3 className="text-lg font-bold text-orange-500 mt-6 mb-2">
              THEO DÕI CHÚNG TÔI
            </h3>
            <div className="flex gap-4 mt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded p-1 hover:opacity-80"
              >
                <FaFacebookF className="text-blue-600 text-xl" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black rounded p-1 hover:opacity-80"
              >
                <FaTiktok className="text-white text-xl" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 rounded p-1 hover:opacity-80"
              >
                <FaYoutube className="text-white text-xl" />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded p-1 hover:opacity-80"
              >
                <SiZalo className="text-blue-500 text-xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded p-1 hover:opacity-80"
              >
                <FaInstagram className="text-black text-xl" />
              </a>
            </div>
          </div>

          {/* Cột 4 */}
          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-4">
              CỬA HÀNG TP.HCM
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://maps.google.com/?q=90+Lê+Văn+Sỹ,+P11,+Phú+Nhuận,+HCM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400"
                >
                  • 90 Lê Văn Sỹ, P11, Phú Nhuận, HCM
                </a>
              </li>
              <li>Mở cửa: 8h30 - 22h00</li>
              <li>
                <a
                  href="https://maps.google.com/?q=61+Quang+Trung,+P10,+Gò+Vấp,+HCM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400"
                >
                  • 61 Quang Trung, P10, Gò Vấp, HCM
                </a>
              </li>
              <li>Mở cửa: 8h30 - 22h00</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Dòng bản quyền */}
      <div className="bg-white text-black text-center text-[13px] px-4 py-4 font-normal leading-relaxed">
        ©2025 by TimeWatch.id.vn. Hotline:{" "}
        <a
          href="tel:0931892222"
          className="font-semibold hover:text-orange-500"
        >
          093.189.2222
        </a>{" "}
        - Đại diện: TimeWatch Lê Văn Sỹ. Địa chỉ:{" "}
        <a
          href="https://maps.google.com/?q=90+Lê+Văn+Sỹ,+P11,+Phú+Nhuận,+Tp.HCM"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-500"
        >
          90 Lê Văn Sỹ, P11, Phú Nhuận, Tp.HCM
        </a>
        . SĐT:{" "}
        <a href="tel:0971112997" className="hover:text-orange-500">
          0971 112 997
        </a>
        . Giấy chứng nhận kinh doanh số:{" "}
        <span className="font-semibold">41P8026738</span> đăng ký lần đầu ngày{" "}
        <span className="font-semibold">01/04/2024</span>. Nơi cấp: Phòng Tài
        Chính – Kế Hoạch Q.Phú Nhuận
      </div>
    </>
  );
}
