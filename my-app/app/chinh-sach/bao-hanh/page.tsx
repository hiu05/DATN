export default function Page() {
  return (
    <main className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tiêu đề trang */}
        <h1 className="text-4xl font-bold text-center text-black mb-6">
          Chính Sách Bảo Hành tại TimeWatch
        </h1>

        {/* Nội dung chính */}
        <section className="space-y-12">
          {/* Mục 1: Chính sách bảo hành */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              1. Chính sách bảo hành
            </h2>
            <p className="text-gray-700">
              Chào mừng bạn đến với TimeWatch! Hãy đọc kỹ chính sách bảo hành của chúng tôi để chúng ta có tiếng nói chung trong khâu bảo hành và tránh tình trạng tranh chấp giữa TimeWatch.vn với khách hàng. Tiêu chí của chúng tôi là: “Tạo điều kiện hết sức cho mọi khách hàng”.
            </p>
            <p className="text-gray-700">
              THẺ hoặc SỔ BẢO HÀNH chính thức này được TimeWatch ghi đầy đủ và chính xác các thông tin của đồng hồ như: Thông tin khách hàng, mã sản phẩm, thời gian bảo hành, cơ sở bảo hành.
            </p>
            <p className="text-gray-700">
              DUY NHẤT TẠI TimeWatch.vn
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>1: Bạn sẽ được bảo hành trọn gói 5 năm tính từ ngày mua tại TimeWatch.</li>
              <li>2: TimeWatch.vn sẽ không có bất cứ quy định khắt khe và không thu bất cứ khoản phí nào trong suốt 5 năm bảo hành (trong trường hợp lỗi được xác định do nhà sản xuất), đồng hồ của bạn có bất cứ lỗi nào từ nhà sản xuất bạn mang qua sẽ được bảo hành.</li>
              <li>3: Hỗ trợ 50% phí bảo hành đối với những lỗi phát sinh do người dùng trong suốt thời gian bảo hành.</li>
            </ul>
          </article>

          {/* Mục 2: Điều kiện bảo hành chung */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              2. Điều kiện bảo hành chung
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>1: TimeWatch.vn sẽ chỉ bảo hành miễn phí cho các lỗi của nhà sản xuất như: hư hỏng các linh kiện bên trong của đồng hồ.</li>
              <li>2: Ngoài ra, riêng đối với dòng đồng hồ Casio, Pin của đồng hồ bạn mua tại hệ thống của TimeWatch.vn sẽ được thay thế miễn phí trọn đời (không áp dụng pin năng lượng từ ánh sáng, loại pin này sẽ áp dụng theo các chính sách bảo hành kèm theo của hãng) và lau dầu cũng miễn phí trong suốt thời gian bảo hành đối với các sản phẩm đồng hồ cơ.</li>
              <li>3: TimeWatch.vn chấp nhận bảo hành ngay cả khi bạn MẤT THẺ hoặc SỔ BẢO HÀNH liên quan tới chiếc đồng hồ của bạn, toàn bộ thông tin khách hàng TimeWatch.vn đã lưu trên hệ thống và có kích hoạt BẢO HÀNH ĐIỆN TỬ thông qua số điện thoại.</li>
            </ul>
          </article>

          {/* Mục 3: Trường hợp không bảo hành */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              3. Trường hợp không bảo hành
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>1: Không bảo hành dây, vỏ vì các bộ phận bên ngoài này sẽ bị hao mòn và lão hoá theo thời gian ví dụ như: vỏ máy bị móp méo do va đập, bị trầy xước, phai màu, bong tróc, nứt vỡ, hỏng khoá dây.</li>
              <li>2: Không bảo hành cho những hậu quả gián tiếp của việc sử dụng không đúng cách của người sử dụng như: đeo đồng hồ trong khi xông hơi, tắm nước nóng, để đồng hồ tiếp xúc với các loại hóa chất, axít, chất tẩy rửa có độ ăn mòn cao…</li>
              <li>3: Không bảo hành cho những đồng hồ đã bị sửa chữa tại những nơi không phải là trung tâm bảo hành được các hãng đồng hồ ủy quyền chính thức hoặc tại TimeWatch.vn, đặc biệt trường hợp khách tự sửa chữa sẽ từ chối bảo hành ngay lập tức.</li>
              <li>4: Không bảo hành cho đồng hồ bị hư hỏng do ảnh hưởng của thiên tai, hỏa hoạn, lũ lụt, tai nạn hoặc cố tình gây hư hỏng.</li>
            </ul>
          </article>

          {/* Mục 4: Địa điểm bảo hành */}
          <article className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              4. Địa điểm bảo hành
            </h2>
            <p className="text-gray-700">
              Bảo hành tại Trung tâm bảo hành
            </p>
            <p className="text-gray-700">
              Nếu đồng hồ của bạn có bảo hành quốc tế và vẫn còn trong thời gian bảo hành, bạn có thể mang qua bất cứ trung tâm bảo hành chính thức của các hãng đặt tại Việt Nam hoặc nước ngoài đều được.
            </p>
            <p className="text-gray-700">
              Để tìm Trung tâm sửa chữa và bảo hành chính thức của hãng, bạn có thể vào website của hãng, tìm phần Service Center hay Service Center Locator hay World Wide Service Center, nhập quốc gia và vị trí bạn đang sống, những địa chỉ của Trung tâm bảo hành của hãng sẽ được hiển thị toàn bộ.
            </p>
            <p className="text-gray-700">
              Một số địa chỉ bảo hành quốc tế tại Việt Nam
            </p>
            <p className="text-gray-700">
              Trung tâm bảo hành đồng hồ Casio, đồng hồ G-Shock/ Baby-G,
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
