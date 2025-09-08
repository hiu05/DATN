"use client";

import { useState } from "react";

export default function ContactPage() {
  // ---- state ----
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [errName, setErrName] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPhone, setErrPhone] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- validators ----
  const vName = (v: string) =>
    !v ? "Họ tên không được để trống" : /\d/.test(v) ? "Họ tên không được chứa số" : "";
  const vEmail = (v: string) =>
    !v ? "Email không được để trống" : /^\S+@\S+\.\S+$/.test(v) ? "" : "Email không hợp lệ";
  const vPhone = (v: string) =>
    !v ? "Số điện thoại không được để trống" : /^(0|\+84)\d{9,10}$/.test(v.replace(/\s+/g,"")) ? "" : "Số điện thoại không hợp lệ";
  const vMsg = (v: string) => (!v ? "Vui lòng nhập nội dung liên hệ" : "");

  const submit = async () => {
    const e1 = vName(fullname);
    const e2 = vEmail(email);
    const e3 = vPhone(phone);
    const e4 = vMsg(message);
    setErrName(e1); setErrEmail(e2); setErrPhone(e3); setErrMessage(e4);
    if (e1 || e2 || e3 || e4) { setAlert("Vui lòng kiểm tra lại thông tin."); return; }

    try {
      setLoading(true);
      setAlert("");
      const res = await fetch("/api/lien-he", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) { setAlert(data?.message || "Gửi thất bại, vui lòng thử lại."); return; }

      setAlert("Gửi thành công! Chúng tôi sẽ liên hệ sớm.");
      setFullname(""); setEmail(""); setPhone(""); setMessage("");
      setErrName(""); setErrEmail(""); setErrPhone(""); setErrMessage("");
    } catch {
      setAlert("Lỗi kết nối máy chủ.");
    } finally { setLoading(false); }
  };

  // ---- styles ----
  const field =
    "peer w-full h-12 rounded-xl border border-gray-200 bg-white/70 px-4 text-gray-900 placeholder-transparent shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 transition";
  const label =
    "pointer-events-none absolute -top-2.5 left-3 bg-white/90 px-2 text-xs font-semibold text-gray-600 rounded";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold uppercase text-orange-500">
            Liên hệ TimeWatch
          </h1>
          <p className="mt-2 text-slate-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn từ 8:00 – 21:00 (T2–CN)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Info card */}
          <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-xl">
            <img
              src="/images/mau.jpg"
              alt="TimeWatch"
              className="h-56 w-full object-cover"
              onError={(e)=>{(e.currentTarget as HTMLImageElement).src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop"}}
            />
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
              <ul className="mt-4 space-y-3 text-slate-600">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                  123 Lê Lợi, Quận 1, TP.HCM
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.79a15.91 15.91 0 006.61 6.61l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1c-9.39 0-17-7.61-17-17a1 1 0 011-1h3.47a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.2 2.2z"/></svg>
                  <a href="tel:+84901234567" className="hover:text-slate-900">(+84) 90 123 4567</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 012 2v.34l-10 6.25L2 6.34V6a2 2 0 012-2zm18 5.14V18a2 2 0 01-2 2H4a2 2 0 01-2-2V9.14l10 6.25 10-6.25z"/></svg>
                  <a href="mailto:support@timewatch.vn" className="hover:text-slate-900">support@timewatch.vn</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm3 2v8h12V8H6z"/></svg>
                  Giờ làm việc: 8:00 – 21:00 (T2–CN)
                </li>
              </ul>

              <div className="mt-6 flex items-center gap-3 text-slate-500">
                <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50" href="#" aria-label="Facebook">f</a>
                <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50" href="#" aria-label="Instagram">◎</a>
                <a className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50" href="#" aria-label="YouTube">▶</a>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="relative rounded-2xl bg-white p-6 md:p-8 shadow-xl ring-1 ring-gray-200">
            <h2 className="text-lg font-bold text-slate-900">Gửi lời nhắn cho chúng tôi</h2>
            <p className="mt-1 text-slate-600 text-sm">Điền thông tin bên dưới, đội ngũ TimeWatch sẽ phản hồi sớm.</p>

            <div className="mt-6 space-y-5">
              {/* Fullname */}
              <div className="relative">
                <input
                  id="fullname"
                  type="text"
                  value={fullname}
                  placeholder="Họ và tên"
                  onChange={(e)=>{ setFullname(e.target.value); setErrName(vName(e.target.value)); }}
                  className={field}
                  aria-invalid={!!errName}
                  aria-describedby="name-err"
                />
                <label htmlFor="fullname" className={label}>Họ và tên</label>
                {errName && <p id="name-err" className="mt-1 text-xs text-red-600">{errName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    onChange={(e)=>{ setEmail(e.target.value); setErrEmail(vEmail(e.target.value)); }}
                    className={field}
                    aria-invalid={!!errEmail}
                    aria-describedby="email-err"
                  />
                  <label htmlFor="email" className={label}>Email</label>
                  {errEmail && <p id="email-err" className="mt-1 text-xs text-red-600">{errEmail}</p>}
                </div>

                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    placeholder="Số điện thoại"
                    onChange={(e)=>{ setPhone(e.target.value); setErrPhone(vPhone(e.target.value)); }}
                    className={field}
                    aria-invalid={!!errPhone}
                    aria-describedby="phone-err"
                  />
                  <label htmlFor="phone" className={label}>Số điện thoại</label>
                  {errPhone && <p id="phone-err" className="mt-1 text-xs text-red-600">{errPhone}</p>}
                </div>
              </div>

              {/* Message */}
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  placeholder="Nội dung"
                  onChange={(e)=>{ setMessage(e.target.value); setErrMessage(vMsg(e.target.value)); }}
                  className="peer w-full min-h-[120px] rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 placeholder-transparent shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 transition"
                  aria-invalid={!!errMessage}
                  aria-describedby="msg-err"
                />
                <label htmlFor="message" className="pointer-events-none absolute -top-2.5 left-3 bg-white/90 px-2 text-xs font-semibold text-gray-600 rounded">Nội dung</label>
                {errMessage && <p id="msg-err" className="mt-1 text-xs text-red-600">{errMessage}</p>}
              </div>

              {/* Alert */}
              {alert && (
                <div className={`rounded-lg px-3 py-2 text-sm ${alert.includes("thành công") ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                  {alert}
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  onClick={submit}
                  disabled={loading}
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang gửi...
                    </span>
                  ) : (
                    "Gửi liên hệ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* (Tuỳ chọn) Bản đồ nhúng */}
         <div className="mt-10 rounded-2xl overflow-hidden shadow ring-1 ring-gray-200">
          <iframe
            title="TimeWatch map"
            src="https://www.google.com/maps?q=Ben+Thanh+Market,+Ho+Chi+Minh,+Vietnam&output=embed"
            className="w-full h-72"
            loading="lazy"
          />
        </div> 
      </section>
    </main>
  );
}
