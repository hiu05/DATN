export default function Page() {
  return (
    <main className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Chính Sách Đổi Trả tại TimeWatch
        </h1>

        {/* Nội dung chính */}
        <section className="space-y-12">
          {/* Mục 1: Đổi hàng do lỗi nhà sản xuất */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              1. Đổi hàng do lỗi nhà sản xuất
            </h2>
            <p className="text-gray-700">
              Trong vòng 7 ngày kể từ ngày mua hàng, nếu sản phẩm bị lỗi bên trong máy mà do nhà sản xuất, quý khách có thể yêu cầu đổi sang mặt hàng mới khác. Quý khách vui lòng gửi sản phẩm lỗi về địa chỉ công ty của chúng tôi. TimeWatch sẽ thẩm định kỹ càng và xác định đúng là do lỗi nhà sản xuất, chúng tôi sẽ tiến hành gửi mẫu mới tương tự cho quý khách và chịu toàn bộ phí vận chuyển.
            </p>
          </article>

          {/* Mục 2: Đổi hàng do không ưng ý */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              2. Đổi hàng do không ưng ý
            </h2>
            <p className="text-gray-700">
              Đối với trường hợp đổi hàng do không ưng ý, quý khách vui lòng liên hệ lại ngay với TimeWatch trong vòng 1-2 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên seal, chưa có dấu hiệu sử dụng. Chúng tôi sẽ kiểm tra, nếu đủ điều kiện, nhân viên tư vấn sẽ liên hệ để hướng dẫn bạn đổi sang mẫu khác. TimeWatch sẽ hỗ trợ đổi 01 lần trong trường hợp quý khách không ưng ý và sẽ chỉ đổi sang mẫu có giá trị bằng hoặc cao hơn. Trường hợp quý khách đổi sang mẫu có giá trị thấp hơn, TimeWatch sẽ không hoàn lại tiền dư.
            </p>
          </article>

          {/* Mục 3: Đổi hàng do lỗi từ phía người dùng */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              3. Đổi hàng do lỗi từ phía người dùng
            </h2>
            <p className="text-gray-700">
              Trong trường hợp lỗi xuất phát từ phía người dùng như đánh rơi, va đập mạnh, sơ ý để nước thấm vào bên trong máy, TimeWatch sẽ hoàn toàn không chịu trách nhiệm và chỉ hỗ trợ khách hàng sửa chữa. Chúng tôi sẽ cố gắng giảm thiểu chi phí nhất cho khách hàng trong khả năng có thể.
            </p>
          </article>

          {/* Mục 4: Chính sách bảo hành */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              4. Chính sách bảo hành
            </h2>
            <p className="text-gray-700">
              Trong thời gian bảo hành 5 năm, nếu máy bị lỗi, hỏng do nhà sản xuất, TimeWatch sẽ tiến hành sửa chữa miễn phí cho khách hàng.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
