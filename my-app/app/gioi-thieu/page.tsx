
"use client";
import Link from "next/link";

const IMAGES = {
  main: "/images/hero-watch.jpg",
  subs: ["/images/detail-1.avif", "/images/detail-3.webp"],
};

const BRAND_VIDEO = "https://www.youtube.com/embed/0wZxUDQIAzk";

export default function GioiThieu() {
  return (
    <main className="min-h-[100vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-white">
      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-yellow-100/40 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 md:pt-16">
        <div className="text-center">
          <p className="uppercase tracking-[0.35em] text-[15px] text-orange-500">TimeWatch</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Tinh hoa chế tác – <span className="text-amber-600">Định nghĩa đẳng cấp</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Bộ sưu tập đồng hồ sang trọng, tuyển chọn kỹ càng từ những nhà chế tác danh tiếng.
            Từng đường nét – một câu chuyện về thời gian và phong cách.
          </p>

        </div>

        {/* 1 ảnh chính + 3 ảnh phụ */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Ảnh chính */}
          <div className="lg:col-span-7">
            <div className="group relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 shadow-xl">
              <div className="relative aspect-[4/3]">
                <img
                  src={IMAGES.main}
                  alt="TimeWatch Hero"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop";
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute left-4 bottom-4 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 backdrop-blur">
                  Bộ sưu tập Signature
                </div>
              </div>
            </div>
          </div>

          {/* Ảnh phụ */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
            {IMAGES.subs.slice(0, 3).map((src, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-black/5 shadow-lg"
              >
                <div className="relative aspect-[16/10]">
                  <img
                    src={src}
                    alt={`TimeWatch detail ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1513863323964-8bed7b2b9c34?q=80&w=1200&auto=format&fit=crop";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Câu chuyện thương hiệu */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Câu chuyện <span className="text-amber-600">TimeWatch</span>
            </h2>
            <p className="mt-3 text-slate-600 leading-7">
              Từ một xưởng nhỏ của những người thợ lành nghề, TimeWatch lớn lên với sứ mệnh mang lại
              trải nghiệm thời gian đẳng cấp cho người Việt. Mỗi chiếc đồng hồ là sự kết hợp hài hoà
              giữa công nghệ và nghệ thuật thủ công, được tuyển chọn khắt khe để đồng hành cùng bạn
              qua những cột mốc đáng nhớ.
            </p>
            <blockquote className="mt-5 rounded-2xl bg-white/70 ring-1 ring-slate-200 p-4 italic text-slate-700">
              “Chúng tôi tin rằng đồng hồ không chỉ là công cụ đo thời gian – mà là di sản cá nhân,
              kể câu chuyện về phong cách và đam mê của mỗi người.”
            </blockquote>

            {/* Timeline */}
            <ul className="mt-6 space-y-4">
              <TimelineItem year="05/2025" title="Khởi nguồn đam mê" desc="Những mẫu đầu tiên xuất xưởng từ xưởng thủ công nhỏ tại Sài Gòn." />
              <TimelineItem year="06/2025" title="Mở rộng bộ sưu tập" desc="Hợp tác cùng các nhà chế tác quốc tế, chuẩn hóa quy trình kiểm định." />
              <TimelineItem year="07/2025" title="Dấu ấn dịch vụ" desc="Ra mắt trung tâm bảo dưỡng & spa đồng hồ – tiêu chuẩn boutique." />
              <TimelineItem year="08/2025" title="Vươn tầm trải nghiệm" desc="Showroom concept mới, dịch vụ cá nhân hoá dây/khắc theo yêu cầu." />
            </ul>
          </div>

          {/* Video giới thiệu */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl">
              <div className="aspect-video">
                <iframe
                  src={BRAND_VIDEO}
                  title="TimeWatch - Brand Story"
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-lg font-bold text-slate-900">Hành trình thương hiệu</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Lắng nghe câu chuyện tạo nên chuẩn mực mới trong trải nghiệm đồng hồ sang trọng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lý do chọn TimeWatch */}
      <section className="mx-auto max-w-6xl px-4 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            icon={
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-7z" />
              </svg>
            }
            title="Tuyển chọn tinh hoa"
            desc="Chính hãng 100%. Tuyển chọn từ các thương hiệu uy tín toàn cầu."
          />
          <Feature
            icon={
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm1 6v5.59l3.3 3.3-1.42 1.42L11 13V7h2z" />
              </svg>
            }
            title="Bảo hành & hậu mãi"
            desc="Bảo hành 24 tháng, đổi trả 7 ngày, chăm sóc bảo dưỡng định kỳ."
          />
          <Feature
            icon={
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6a1 1 0 011-1h16a1 1 0 011 1v11a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 2v9h14V8H5z" />
              </svg>
            }
            title="Giao nhanh & an toàn"
            desc="Đóng gói chống sốc; giao nhanh nội thành 2h."
          />
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-white/80 backdrop-blur ring-1 ring-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900">
              Sẵn sàng nâng tầm phong cách của bạn?
            </h3>
            <p className="text-slate-600 mt-1">
              Đặt lịch hẹn tại showroom hoặc trò chuyện cùng chuyên gia TimeWatch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/san-pham"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold shadow hover:bg-black"
            >
              Xem đồng hồ
            </Link>
            <Link
              href="/lien-he"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-slate-200 p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-amber-50 p-2 ring-1 ring-amber-100">{icon}</div>
        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm text-slate-600 leading-6">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ year, title, desc }: { year: string; title: string; desc: string }) {
  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-amber-500 ring-4 ring-amber-100" />
      <div className="text-sm uppercase tracking-wider text-amber-700 font-semibold">{year}</div>
      <div className="text-base font-bold text-slate-900">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{desc}</p>
    </li>
  );
}
