import Image from "next/image";

export default function Page() {
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 leading-relaxed">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-black mb-4 text-center">
          Tin tức TimeWatch
        </h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          Chào mừng bạn đến với chuyên mục tin tức TimeWatch. Tại đây, chúng tôi
          sẽ cập nhật những thông tin mới nhất về sản phẩm, xu hướng thời trang
          đồng hồ, cũng như các sự kiện, ưu đãi và hoạt động cộng đồng mà
          TimeWatch đang thực hiện.
        </p>

        {/* Mục 1 */}
        <article className="mb-16 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Sự kiện nổi bật: Ra mắt bộ sưu tập 2025
          </h2>
          <div className="relative h-72 rounded-xl overflow-hidden shadow-md mb-6 group">
            <Image
              src="/images/casio-tintuc.jpg"
              alt="Ra mắt bộ sưu tập TimeWatch 2025"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Ngày 15/01/2025, TimeWatch chính thức giới thiệu{" "}
            <span className="font-semibold">bộ sưu tập đồng hồ mới 2025</span> tại
            sự kiện hoành tráng ở TP. Hồ Chí Minh. Bộ sưu tập mang phong cách
            hiện đại, tinh tế và sang trọng, được thiết kế nhằm đáp ứng nhu cầu
            ngày càng cao về thẩm mỹ và chất lượng của khách hàng.
          </p>
          <p className="text-gray-700 mb-4">
            Điểm nhấn của bộ sưu tập năm nay là sự kết hợp độc đáo giữa{" "}
            <span className="italic">công nghệ tiên tiến</span> và{" "}
            <span className="italic">nghệ thuật chế tác thủ công</span>, tạo nên
            những chiếc đồng hồ không chỉ là công cụ đo thời gian mà còn là biểu
            tượng thời trang.
          </p>
        </article>

        {/* Mục 2 */}
        <article className="mb-16 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Ưu đãi khuyến mãi mùa hè
          </h2>
          <div className="relative h-72 rounded-xl overflow-hidden shadow-md mb-6 group">
            <Image
              src="/images/casio-tintuc1.png"
              alt="Khuyến mãi mùa hè TimeWatch"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Nhằm tri ân khách hàng, TimeWatch triển khai chương trình khuyến mãi
            mùa hè đặc biệt. Từ ngày 01/06/2025 đến 30/07/2025, tất cả các mẫu
            đồng hồ chính hãng sẽ được giảm giá đến{" "}
            <span className="font-bold text-orange-600">30%</span>.
          </p>
          <p className="text-gray-700 mb-4">
            Chương trình áp dụng toàn hệ thống showroom và cả online. Đây là cơ
            hội tuyệt vời để sở hữu những mẫu đồng hồ cao cấp với mức giá hấp dẫn.
          </p>
        </article>

        {/* Mục 3 */}
        <article className="mb-16 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Hoạt động cộng đồng
          </h2>
          <div className="relative h-72 rounded-xl overflow-hidden shadow-md mb-6 group">
            <Image
              src="/images/casio-tintuc2.jpg"
              alt="Hoạt động cộng đồng TimeWatch"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Bên cạnh hoạt động kinh doanh, TimeWatch luôn chú trọng trách nhiệm
            xã hội. Trong tháng 03/2025, TimeWatch đã đồng hành cùng Quỹ Bảo trợ
            Trẻ em Việt Nam trong chương trình{" "}
            <span className="font-medium">“Thời gian cho em”</span>, nhằm gây
            quỹ hỗ trợ trẻ em có hoàn cảnh khó khăn.
          </p>
          <p className="text-gray-700 mb-4">
            Chúng tôi tin rằng mỗi chiếc đồng hồ không chỉ mang giá trị vật chất
            mà còn có thể góp phần tạo nên những khoảnh khắc ý nghĩa trong cuộc
            sống. TimeWatch cam kết sẽ tiếp tục thực hiện nhiều hoạt động cộng
            đồng để mang lại giá trị tích cực cho xã hội.
          </p>
        </article>
      </div>
    </main>
  );
}
