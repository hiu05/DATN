export default function Page() {
  return (
    <main className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Chính Sách Bảo Mật tại WatchStore
        </h1>

        {/* Nội dung chính */}
        <section className="space-y-12">
          {/* Mục 1: Thu thập thông tin cá nhân */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              1. Thu thập thông tin cá nhân
            </h2>
            <p className="text-gray-700">
              Chúng tôi thu thập, lưu trữ và xử lý thông tin của bạn cho quá trình mua hàng và cho những thông báo sau này liên quan đến đơn hàng, và để cung cấp dịch vụ, bao gồm một số thông tin cá nhân: danh hiệu, tên, giới tính, ngày sinh, email, địa chỉ, địa chỉ giao hàng, số điện thoại, fax, chi tiết thanh toán, chi tiết thanh toán bằng thẻ hoặc chi tiết tài khoản ngân hàng.
            </p>
            <p className="text-gray-700">
              Chúng tôi sẽ dùng thông tin quý khách đã cung cấp để xử lý đơn đặt hàng, cung cấp các dịch vụ và thông tin yêu cầu thông qua website và theo yêu cầu của bạn.
            </p>
            <p className="text-gray-700">
              Hơn nữa, chúng tôi sẽ sử dụng các thông tin đó để quản lý tài khoản của bạn; xác minh và thực hiện giao dịch trực tuyến, nhận diện khách vào web, nghiên cứu nhân khẩu học, gửi thông tin bao gồm thông tin sản phẩm và dịch vụ. Nếu quý khách không muốn nhận bất cứ thông tin tiếp thị của chúng tôi thì có thể từ chối bất cứ lúc nào.
            </p>
            <p className="text-gray-700">
              Chúng tôi có thể chuyển tên và địa chỉ cho bên thứ ba để họ giao hàng cho bạn (ví dụ cho bên chuyển phát nhanh hoặc nhà cung cấp).
            </p>
          </article>

          {/* Mục 2: Bảo mật thông tin */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              2. Bảo mật thông tin
            </h2>
            <p className="text-gray-700">
              Chúng tôi có biện pháp thích hợp về kỹ thuật và an ninh để ngăn chặn truy cập trái phép hoặc trái pháp luật hoặc mất mát hoặc tiêu hủy hoặc thiệt hại cho thông tin của bạn.
            </p>
            <p className="text-gray-700">
              Chúng tôi khuyên quý khách không nên đưa thông tin chi tiết về việc thanh toán với bất kỳ ai bằng e-mail, chúng tôi không chịu trách nhiệm về việc sử dụng sai mật khẩu nếu đây không phải lỗi của chúng tôi.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
