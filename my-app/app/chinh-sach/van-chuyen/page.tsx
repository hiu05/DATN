export default function Page() {
  return (
    <main className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Chính Sách Vận Chuyển tại TimeWatch
        </h1>

        {/* Nội dung chính */}
        <section className="space-y-12">
          {/* Mục 1: Phạm vi áp dụng */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              1. Phạm vi áp dụng
            </h2>
            <p className="text-gray-700">
              Chính sách vận chuyển áp dụng đối với các khách hàng không mua trực tiếp tại các cửa hàng của TimeWatch.
            </p>
            <p className="text-gray-700">
              Sản phẩm được giao hàng bằng dịch vụ Chuyển phát nhanh và dịch vụ Ship hàng COD (thanh toán khi nhận hàng) tới địa chỉ theo yêu cầu của khách hàng trên toàn quốc. Quý khách hàng được bóc hàng và kiểm tra hàng thoải mái trước khi quyết định thanh toán.
            </p>
          </article>

          {/* Mục 2: Cách thức giao hàng */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              2. Cách thức giao hàng
            </h2>
            <p className="text-gray-700">
              Đối với phương thức thanh toán chuyển khoản: Quý khách thanh toán bằng cách chuyển khoản cho TimeWatch qua một trong các tài khoản ngân hàng hiện có. Chúng tôi sẽ gửi sản phẩm cho quý khách bằng hình thức chuyển phát nhanh của bưu điện cho tất cả các địa chỉ trên toàn quốc một cách nhanh chóng và hoàn toàn miễn phí.
            </p>
            <p className="text-gray-700">
              Đối với dịch vụ ship COD, là hình thức thanh toán khi nhận hàng. Sau khi quý khách hàng cung cấp thông tin và địa chỉ, Nhân viên giao hàng sẽ giao sản phẩm và nhận tiền tận nơi theo yêu cầu của quý khách.
            </p>
          </article>

          {/* Mục 3: Thời gian giao hàng */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              3. Thời gian giao hàng
            </h2>
            <p className="text-gray-700">
              Sản phẩm sẽ được giao trong vòng 1-2 giờ trong trường hợp sẵn hàng tại khu vực nội thành Hà Nội, Đà Nẵng và TP Hồ Chí Minh bằng hình thức nhân viên giao hàng trực tiếp, trường hợp không sẵn hàng chúng tôi sẽ giao trong 1-3 ngày trong tuần.
            </p>
            <p className="text-gray-700">
              Đối với khách hàng ở ngoại thành Hà Nội, TP Hồ Chí Minh, các Tỉnh/Thành phố khác chúng tôi sẽ giao hàng trong vòng 2-4 ngày (ngày làm việc, không tính cuối tuần) bằng hình thức Chuyển phát nhanh và hình thức ship COD. Thời gian trên không tính các ngày lễ, ngày nghỉ.
            </p>
            <p className="text-gray-700">
              Ngoài các hình thức giao hàng thông thường trên, chúng tôi sẽ áp dụng chính sách giao hàng ngay lập tức theo thỏa thuận hoặc yêu cầu đặc biệt của khách hàng nếu có khả năng. Ngoại trừ một số trường hợp khách quan, chúng tôi có thể giao hàng chậm trễ so với thời gian cam kết do những điều kiện bất khả kháng như thời tiết xấu, điều kiện giao thông không thuận lợi, máy bay trễ chuyến, xe hỏng hóc trên đường giao hàng, trục trặc trong quá trình chờ xuất hàng.
            </p>
          </article>

          {/* Mục 4: Trách nhiệm với hàng hóa vận chuyển */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              4. Trách nhiệm với hàng hóa vận chuyển
            </h2>
            <p className="text-gray-700">
              Dịch vụ vận chuyển do TimeWatch trực tiếp thực hiện hoặc được ủy quyền chúng tôi sẽ chịu trách nhiệm với hàng hóa và các rủi ro như mất mát hoặc hư hại của hàng hóa trong suốt quá trình vận chuyển hàng.
            </p>
            <p className="text-gray-700">
              Khách hàng có trách nhiệm kiểm tra hàng hóa khi nhận hàng. Khi phát hiện hàng hóa bị hư hại, trầy xước, bể vỡ, mốp méo, hoặc sai mẫu mã so với hàng đã đặt mua thì ký xác nhận tình trạng hàng hóa với Nhân viên giao nhận và thông báo ngay cho chúng tôi để giải quyết.
            </p>
            <p className="text-gray-700">
              Sau khi khách đã ký nhận hàng mà không ghi chú hoặc có ý kiến về hàng hóa, đồng nghĩa với việc TimeWatch không có trách nhiệm với những yêu cầu đổi trả vì hư hỏng, trầy xước, bể vỡ, mốp méo, sai hàng hóa, vv… sau này.
            </p>
            <p className="text-gray-700">
              Nếu dịch vụ vận chuyển do khách chỉ định hoặc nhờ người thân, bạn bè chuyển giúp thì khách hàng sẽ chịu trách nhiệm với hàng hóa và các rủi ro như mất mát hoặc hư hại của hàng hóa trong suốt quá trình vận chuyển hàng từ cửa hàng đến khách hàng. Trong trường hợp này khách hàng sẽ chịu trách nhiệm cước phí và các tổn thất liên quan.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
