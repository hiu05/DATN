// app/ve-timewatch/chung-nhan-dai-ly/page.tsx
import Image from "next/image";
import React from "react";

export default function ChungNhanDaiLy() {
  return (
    <div className="min-h-screen py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black text-center mb-6">
          Chứng nhận Đại lý Chính thức
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
          TimeWatch tự hào là đại lý phân phối chính thức của nhiều thương hiệu
          đồng hồ quốc tế. Mỗi sản phẩm đều có giấy chứng nhận rõ ràng và được
          bảo hành chính hãng.
        </p>

        <div className="mt-20 bg-white rounded-2xl p-8 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Đại lý chính thức
            </h2>
            <p className="text-gray-700 mb-6">
              Tất cả sản phẩm TimeWatch cung cấp đều được nhập khẩu chính ngạch,
              kèm giấy tờ chứng nhận đại lý từ hãng.
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Lợi ích khách hàng
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Bảo hành chính hãng toàn cầu</li>
              <li>Giấy tờ đầy đủ, minh bạch</li>
              <li>Đảm bảo chất lượng 100% chính hãng</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Image
              src="/images/chungnhan.png"
              alt="Giấy chứng nhận TimeWatch"
              width={500}
              height={300}
              className="rounded-xl shadow-md object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
