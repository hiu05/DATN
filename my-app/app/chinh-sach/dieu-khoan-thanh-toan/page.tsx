export default function Page() {
  return (
    <main className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Điều Khoản Thanh Toán tại TimeWatch
        </h1>

        {/* Nội dung chính */}
        <section className="space-y-12">
          {/* Mục 1: Thanh toán chuyển khoản */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              1. Thanh toán chuyển khoản
            </h2>
            <p className="text-gray-700">
              Quý khách vui lòng chuyển khoản qua tài khoản ngân hàng sau:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Ngân hàng:</strong> MB Bank</li>
              <li><strong>Chủ tài khoản:</strong> LE VINH PHI ANH</li>
              <li><strong>Số tài khoản:</strong> 99968686868686</li>
              <li><strong>Chi nhánh:</strong> Thành phố HCM</li>
            </ul>
            <p className="text-gray-700">
              Lưu ý: Quý khách chỉ nên chuyển khoản sau khi đội ngũ nhân viên của TimeWatch đã gọi điện xác nhận đơn hàng. Sau khi nhận tiền, chúng tôi sẽ tiến hành xử lý đơn hàng cho bạn. Trong trường hợp quý khách không nhận hàng, chúng tôi sẽ hoàn tiền lại cho bạn (chỉ trừ phí vận chuyển).
            </p>
          </article>

          {/* Mục 2: Thanh toán khi nhận hàng */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              2. Thanh toán khi nhận hàng (COD)
            </h2>
            <ol className="list-decimal pl-6 text-gray-700 space-y-1">
              <li>Quý khách gọi điện tới số Hotline của chúng tôi hoặc đặt hàng online trên website TimeWatch.id.vn.</li>
              <li>Chúng tôi sẽ gọi điện xác nhận đơn hàng và tiến hành giao hàng.</li>
              <li>Quý khách kiểm tra hàng kỹ lưỡng, nếu đúng sản phẩm và chất lượng, vui lòng thanh toán tiền cho nhân viên giao hàng.</li>
              <li>Quý khách có quyền từ chối nhận hàng nếu không hài lòng.</li>
            </ol>
          </article>

          {/* Mục 3: Thanh toán qua Fundiin */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              3. Thanh toán qua Fundiin (Trả góp 0%)
            </h2>
            <p className="text-gray-700">
              TimeWatch hợp tác với Fundiin để mang đến cho khách hàng hình thức thanh toán trả góp 0% lãi suất:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Chỉ cần thanh toán trước 1 kỳ đầu tiên, hai kỳ tiếp theo sẽ thanh toán trong 2 tháng còn lại.</li>
              <li>Quý khách sẽ nhận hàng sau khi thanh toán thành công kỳ đầu tiên.</li>
              <li>Chi tiết về cách thanh toán qua Fundiin, vui lòng tham khảo tại <a href="https://www.fundiin.vn" className="text-orange-600">https://www.fundiin.vn</a>.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
