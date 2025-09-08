import Image from "next/image";

export default function Page() {
  return (
    <main className=" min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 leading-relaxed">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-black mb-4 text-center">
          Toplist TimeWatch
        </h1>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          Chuyên mục <span className="font-semibold">Toplist TimeWatch</span> sẽ
          mang đến cho bạn những bảng xếp hạng đồng hồ nổi bật nhất theo từng
          xu hướng, nhu cầu và đánh giá thực tế từ khách hàng. Đây sẽ là nguồn
          tham khảo hữu ích trước khi bạn chọn mua chiếc đồng hồ yêu thích.
        </p>

        {/* Mục 1 */}
        <article className="mb-16 p-6 bg-white rounded-2xl  hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Top 5 đồng hồ nam bán chạy nhất 2025
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group">
            <Image
              src="/images/toplist1.jpg"
              alt="Top 5 đồng hồ nam bán chạy 2025"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Năm 2025 đánh dấu sự lên ngôi của những mẫu{" "}
            <span className="font-medium">đồng hồ nam thể thao – lịch lãm</span>.
            Với thiết kế mạnh mẽ, tính năng hiện đại và giá cả hợp lý, top 5 mẫu
            đồng hồ nam được ưa chuộng nhất đã tạo nên cơn sốt trong giới mộ điệu.
          </p>
          <p className="text-gray-700 mb-4">
            Đứng đầu danh sách chính là{" "}
            <span className="font-semibold">Seiko SNZG15J1</span>, mẫu đồng hồ
            quân đội bền bỉ và nam tính. Tiếp đến là{" "}
            <span className="font-semibold">Orient Kamasu RA-AA0003R19B</span> với
            thiết kế mặt số đỏ rực ấn tượng. Những mẫu từ{" "}
            <span className="italic">Fossil</span> và{" "}
            <span className="italic">Citizen</span> cũng góp mặt, khẳng định vị
            thế trong lòng người dùng trẻ.
          </p>
        </article>

        {/* Mục 2 */}
        <article className="mb-16 p-6 bg-white rounded-2xl  hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Top 5 đồng hồ nữ thanh lịch nhất 2025
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group">
            <Image
              src="/images/toplist2.jpg"
              alt="Top 5 đồng hồ nữ thanh lịch 2025"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Thị trường đồng hồ nữ năm 2025 chứng kiến sự bùng nổ của các thiết kế
            <span className="italic"> mảnh mai, tinh xảo và sang trọng</span>. Với
            xu hướng thời trang tối giản, những chiếc đồng hồ không chỉ đơn thuần
            là phụ kiện mà còn là biểu tượng của phong cách sống hiện đại.
          </p>
          <p className="text-gray-700 mb-4">
            Những mẫu đến từ <span className="font-medium">Michael Kors</span> và{" "}
            <span className="font-medium">Daniel Wellington</span> tiếp tục khẳng
            định sức hút trong giới trẻ. Bên cạnh đó, các thương hiệu như{" "}
            <span className="italic">Tissot</span> và{" "}
            <span className="italic">Casio Sheen</span> cũng ghi dấu ấn mạnh mẽ
            với các thiết kế nữ tính, trẻ trung.
          </p>
        </article>

        {/* Mục 3 */}
        <article className="mb-16 p-6 bg-white rounded-2xl hover:-translate-y-1 transition duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Top 5 thương hiệu đồng hồ được yêu thích nhất
          </h2>
          <div className="relative h-100 rounded-xl overflow-hidden mb-6 group">
            <Image
              src="/images/toplist3.jpg"
              alt="Top 5 thương hiệu đồng hồ được yêu thích"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="text-gray-700 mb-4">
            Khảo sát khách hàng 2025 của TimeWatch cho thấy{" "}
            <span className="font-medium">Seiko, Orient, Citizen, Casio</span> và{" "}
            <span className="font-medium">Fossil</span> là 5 thương hiệu được yêu
            thích nhất. Đây là những cái tên gắn liền với chất lượng bền bỉ, thiết
            kế đa dạng và mức giá hợp lý cho nhiều phân khúc.
          </p>
          <p className="text-gray-700 mb-4">
            Trong đó, <span className="italic">Seiko</span> và{" "}
            <span className="italic">Orient</span> nổi bật với nghệ thuật chế tác
            tinh vi, trong khi <span className="italic">Citizen</span> dẫn đầu về
            công nghệ Eco-Drive thân thiện môi trường.{" "}
            <span className="italic">Casio</span> và{" "}
            <span className="italic">Fossil</span> lại mang đến sự trẻ trung, năng
            động, phù hợp với giới trẻ yêu thích phong cách thời trang hiện đại.
          </p>
        </article>
      </div>
    </main>
  );
}
