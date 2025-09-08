import Image from "next/image";

export default function Page() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 leading-relaxed">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-black mb-4 text-center">
          Kiến thức TimeWatch
        </h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          Chuyên mục <span className="font-semibold">Kiến thức TimeWatch</span>{" "}
          cung cấp những kiến thức cơ bản về thời gian và cách sử dụng đồng hồ,
          đặc biệt là các mẫu đồng hồ Casio phổ biến. Bạn sẽ tìm hiểu từ tháng,
          ngày, giờ, phút cho đến cách đọc và chỉnh giờ chuẩn xác.
        </p>

        {/* Mục 1 */}
        <article className="mb-16 p-6 bg-white rounded-2xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Tháng là gì và cách xem trên đồng hồ Casio
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group flex justify-center items-center">
            <Image
              src="/images/kienthuc2.png"
              alt="Khái niệm tháng và cách xem"
              width={700}
              height={200}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            <span className="font-medium">Tháng</span> là đơn vị đo lường thời
            gian dùng để chia nhỏ một năm. Một năm thường có 12 tháng, với độ
            dài từ 28 đến 31 ngày tùy theo từng tháng. Trên đồng hồ Casio điện
            tử, tháng thường được hiển thị dưới dạng số ở góc màn hình, ví dụ
            “01” cho tháng 1, “12” cho tháng 12.
          </p>
          <p className="text-gray-700 mb-4">
            Khi chỉnh tháng trên đồng hồ Casio, bạn thường cần vào chế độ{" "}
            <span className="italic">Setting</span> hoặc{" "}
            <span className="italic">Adjust</span>, sử dụng nút{" "}
            <span className="font-semibold">Mode</span> để di chuyển đến thông
            số tháng, sau đó dùng các nút{" "}
            <span className="font-semibold">Forward/Reverse</span>
            để tăng hoặc giảm số tháng cho đúng.
          </p>
        </article>

        {/* Mục 2 */}
        <article className="mb-16 p-6 bg-white rounded-2xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Ngày là gì và cách đọc trên đồng hồ Casio
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group flex justify-center items-center">
            <Image
              src="/images/kienthuc1.jpg"
              alt="Khái niệm ngày và cách đọc"
              width={600}
              height={200}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            <span className="font-medium">Ngày</span> là đơn vị thời gian cơ
            bản, tính bằng vòng quay Trái Đất quanh trục, kéo dài khoảng 24 giờ.
            Trên đồng hồ Casio, ngày được hiển thị dưới dạng số từ 1 đến 31. Một
            số mẫu còn hiển thị thêm thứ trong tuần (Mon, Tue, Wed,…).
          </p>
          <p className="text-gray-700 mb-4">
            Khi muốn chỉnh ngày, bạn chuyển đồng hồ sang chế độ{" "}
            <span className="italic">Adjust</span>, sau đó chọn mục{" "}
            <span className="font-semibold">Date</span> và dùng nút
            <span className="font-semibold">Forward/Reverse</span> để điều chỉnh
            đúng ngày. Lưu ý, nếu chỉnh sai tháng, ngày có thể nhảy sai, do đó
            nên chỉnh theo thứ tự tháng → ngày.
          </p>
        </article>

        {/* Mục 3 */}
        <article className="mb-16 p-6 bg-white rounded-2xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Giờ và phút, cách chỉnh và đọc trên đồng hồ Casio
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group flex justify-center items-center">
            <Image
              src="/images/kienthuc1.jpg"
              alt="Khái niệm giờ và phút"
              width={600}
              height={200}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            <span className="font-medium">Giờ và phút</span> là đơn vị đo lường
            thời gian cơ bản nhất, chia nhỏ ngày thành 24 giờ, mỗi giờ có 60
            phút. Trên đồng hồ Casio analog, kim giờ và kim phút chỉ giờ và
            phút; trên đồng hồ điện tử, giờ và phút được hiển thị trực tiếp bằng
            số.
          </p>
          <p className="text-gray-700 mb-4">Để chỉnh giờ và phút, bạn cần:</p>
          <ul className="list-disc ml-6 mb-4 text-gray-700">
            <li>
              Vào chế độ <span className="italic">Adjust</span>.
            </li>
            <li>
              Chọn mục <span className="font-semibold">Hour/Minute</span> bằng
              nút <span className="font-semibold">Mode</span>.
            </li>
            <li>
              Sử dụng nút <span className="font-semibold">Forward/Reverse</span>{" "}
              để tăng hoặc giảm giờ, phút.
            </li>
          </ul>
          <p className="text-gray-700 mb-4">
            Trên đồng hồ Casio có thể cài đặt định dạng 12h hoặc 24h, và hiển
            thị AM/PM. Khi đọc giờ, lưu ý xem định dạng để tránh nhầm lẫn giữa
            buổi sáng và buổi chiều.
          </p>
          <p className="text-gray-700 mb-4">
            Việc hiểu rõ cách xem và chỉnh giờ, phút giúp bạn sử dụng đồng hồ
            chính xác, đặc biệt hữu ích với những mẫu Casio có nhiều chức năng
            như báo thức, bấm giờ, world time.
          </p>
        </article>
      </div>
    </main>
  );
}
