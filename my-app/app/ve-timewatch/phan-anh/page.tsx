// app/ve-timewatch/phan-anh/page.tsx
import Image from "next/image";
import React from "react";

export default function PhanAnhKhieuNai() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-black text-center mb-6">
          Phản ánh - Khiếu nại
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
          TimeWatch luôn lắng nghe mọi ý kiến đóng góp và phản ánh từ khách hàng
          nhằm nâng cao chất lượng dịch vụ và sản phẩm. Chúng tôi cam kết xử lý
          mọi phản hồi một cách nhanh chóng, minh bạch và tận tâm.
        </p>

        {/* Nội dung */}
        <div className="bg-white rounded-2xl p-8 grid md:grid-cols-2 gap-10 items-start">
          {/* Cột trái: Thông tin */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Cách gửi phản ánh
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                📞 Hotline: <span className="font-medium">0931 892 222</span>
              </li>
              <li>
                ✉️ Email:{" "}
                <a
                  href="mailto:support@timewatch.vn"
                  className="hover:text-slate-900"
                >
                  support@timewatch.vn
                </a>
              </li>
              <li>🏬 Trực tiếp tại cửa hàng TimeWatch trên toàn quốc</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              2. Thời gian xử lý
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Phản ánh sẽ được tiếp nhận ngay lập tức và phản hồi trong vòng{" "}
              <span className="font-medium">24h làm việc</span>. Những trường
              hợp phức tạp có thể cần thêm thời gian nhưng sẽ luôn được thông
              báo rõ ràng.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              3. Cam kết của chúng tôi
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Đảm bảo quyền lợi khách hàng</li>
              <li>Bảo mật thông tin phản ánh</li>
              <li>Giải quyết minh bạch và nhanh chóng</li>
            </ul>
          </div>

          {/* Cột phải: Hình ảnh */}
          <div className="space-y-6 flex flex-col items-center">
            {/* Ảnh 2 */}
            <div className="w-full mt-10 group">
              <Image
                src="/images/khieu-nai.jpg"
                alt="Khách hàng TimeWatch"
                width={500}
                height={300}
                className="rounded-xl shadow-md object-cover mx-auto transform transition duration-300 "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
