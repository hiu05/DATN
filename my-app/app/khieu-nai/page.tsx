/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type UploadFile = File & { preview?: string };

const ORANGE_BTN =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition disabled:opacity-60";

const fieldBase =
  "peer w-full h-12 rounded-xl border border-gray-200 bg-white/70 px-4 text-gray-900 placeholder-transparent shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 transition";
const labelBase =
  "pointer-events-none absolute -top-2.5 left-3 bg-white/90 px-2 text-xs font-semibold text-gray-600 rounded";

const categories = [
  "Sản phẩm lỗi/không đúng mô tả",
  "Vận chuyển/Giao hàng",
  "Đổi trả/Bảo hành",
  "Thanh toán/Hóa đơn",
  "Thái độ phục vụ",
  "Khác",
] as const;

export default function KhieuNaiPage() {
  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [topic, setTopic] = useState<typeof categories[number] | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactBy, setContactBy] = useState<"email" | "phone">("email");
  const [agree, setAgree] = useState(false);

  // files
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // validators
  const vName = (v: string) =>
    !v ? "Vui lòng nhập họ tên" : /\d/.test(v) ? "Họ tên không được chứa số" : "";
  const vEmail = (v: string) =>
    !v ? "Vui lòng nhập email" : /^\S+@\S+\.\S+$/.test(v) ? "" : "Email không hợp lệ";
  const vPhone = (v: string) =>
    !v ? "Vui lòng nhập số điện thoại" : /^(0|\+84)\d{9,10}$/.test(v.replace(/\s+/g, "")) ? "" : "SĐT không hợp lệ";
  const vTopic = (v: string) => (!v ? "Vui lòng chọn nhóm khiếu nại" : "");
  const vSubject = (v: string) => (!v.trim() ? "Vui lòng nhập tiêu đề" : "");
  const vMsg = (v: string) => (!v.trim() ? "Vui lòng mô tả chi tiết vấn đề" : "");

  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eTopic, setETopic] = useState("");
  const [eSubject, setESubject] = useState("");
  const [eMsg, setEMsg] = useState("");
  const [eAgree, setEAgree] = useState("");

  const charMax = 800;
  const chars = message.length;
  const remain = Math.max(0, charMax - chars);

  const canSubmit = useMemo(() => {
    return (
      !vName(fullName) &&
      !vEmail(email) &&
      !vPhone(phone) &&
      !vTopic(topic) &&
      !vSubject(subject) &&
      !vMsg(message) &&
      agree
    );
  }, [fullName, email, phone, topic, subject, message, agree]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const current = [...files];
    for (const f of picked) {
      if (current.length >= 3) break; // tối đa 3 file
      const okType =
        f.type.startsWith("image/") || f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      const okSize = f.size <= 3 * 1024 * 1024; // 3MB
      if (!okType || !okSize) continue;
      const withPreview: UploadFile = Object.assign(f, {
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      });
      current.push(withPreview);
    }
    setFiles(current);
    e.currentTarget.value = ""; // reset input
  };

  const removeFile = (idx: number) => {
    const next = [...files];
    const f = next[idx];
    if (f?.preview) URL.revokeObjectURL(f.preview);
    next.splice(idx, 1);
    setFiles(next);
  };

  const submit = async () => {
    // set errors
    const a = vName(fullName);
    const b = vEmail(email);
    const c = vPhone(phone);
    const d = vTopic(topic);
    const e = vSubject(subject);
    const f = vMsg(message);
    const g = agree ? "" : "Vui lòng xác nhận đồng ý xử lý thông tin khiếu nại";

    setEName(a);
    setEEmail(b);
    setEPhone(c);
    setETopic(d);
    setESubject(e);
    setEMsg(f);
    setEAgree(g);

    if (a || b || c || d || e || f || g) {
      setAlert({ type: "error", text: "Vui lòng kiểm tra các trường được đánh dấu." });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);

      const form = new FormData();
      form.append("full_name", fullName);
      form.append("email", email);
      form.append("phone", phone);
      form.append("order_code", orderCode || "");
      form.append("topic", topic);
      form.append("subject", subject);
      form.append("message", message);
      form.append("contact_by", contactBy);

      files.forEach((f, i) => form.append("attachments", f, f.name));

      const res = await fetch("/api/khieu-nai", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", text: data?.message || "Gửi khiếu nại thất bại. Vui lòng thử lại." });
        return;
      }

      setAlert({
        type: "success",
        text: `Tiếp nhận thành công! Mã hồ sơ: ${data?.ticket || "TN-" + Math.floor(Math.random() * 999999)}`,
      });

      // reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setOrderCode("");
      setTopic("");
      setSubject("");
      setMessage("");
      setContactBy("email");
      setAgree(false);
      setFiles((prev) => {
        prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        return [];
      });
    } catch (err) {
      setAlert({ type: "error", text: "Không thể kết nối máy chủ." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white">
      {/* background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* breadcrumb */}
        <div className="text-sm text-slate-500 mb-4">
          <Link href="/" className="text-orange-600 hover:underline">Trang chủ</Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-700">Phản ánh – Khiếu nại</span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Phản ánh – <span className="text-orange-600">Khiếu nại</span>
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Chúng tôi trân trọng mọi góp ý để hoàn thiện trải nghiệm của bạn. Vui lòng điền thông tin bên dưới.
          </p>
        </div>

        {/* form card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* left: note/help */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-slate-200 p-5 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900">Hỗ trợ nhanh</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Thời gian phản hồi: <b>8:00–21:00</b> (T2–CN)</li>
                <li>• Hotline: <a className="text-orange-600 hover:underline" href="tel:+84901234567">(+84) 90 123 4567</a></li>
                <li>• Email: <a className="text-orange-600 hover:underline" href="mailto:support@timewatch.vn">support@timewatch.vn</a></li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-slate-200 p-5 shadow-lg">
              <h3 className="font-bold text-slate-900">Mẹo gửi khiếu nại hiệu quả</h3>
              <p className="text-sm text-slate-600 mt-2">
                Vui lòng mô tả cụ thể vấn đề, kèm mã đơn hàng (nếu có) và ảnh minh họa. Điều này giúp chúng tôi xử lý nhanh hơn.
              </p>
            </div>
          </aside>

          {/* right: form */}
          <div className="lg:col-span-8 rounded-2xl bg-white p-6 md:p-8 shadow-xl ring-1 ring-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Họ tên */}
              <div className="relative">
                <input
                  id="fullName"
                  className={`${fieldBase} ${eName ? "ring-2 !ring-red-500" : ""}`}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setEName(vName(e.target.value));
                  }}
                  placeholder="Họ và tên"
                />
                <label htmlFor="fullName" className={labelBase}>Họ và tên *</label>
                {eName && <p className="mt-1 text-xs text-red-600">{eName}</p>}
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  id="email"
                  className={`${fieldBase} ${eEmail ? "ring-2 !ring-red-500" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEEmail(vEmail(e.target.value));
                  }}
                  placeholder="Email"
                  type="email"
                />
                <label htmlFor="email" className={labelBase}>Email *</label>
                {eEmail && <p className="mt-1 text-xs text-red-600">{eEmail}</p>}
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  id="phone"
                  className={`${fieldBase} ${ePhone ? "ring-2 !ring-red-500" : ""}`}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setEPhone(vPhone(e.target.value));
                  }}
                  placeholder="Số điện thoại"
                  type="tel"
                />
                <label htmlFor="phone" className={labelBase}>Số điện thoại *</label>
                {ePhone && <p className="mt-1 text-xs text-red-600">{ePhone}</p>}
              </div>

              {/* Order code (optional) */}
              <div className="relative">
                <input
                  id="orderCode"
                  className={fieldBase}
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="Mã đơn hàng (nếu có)"
                />
                <label htmlFor="orderCode" className={labelBase}>Mã đơn hàng (nếu có)</label>
              </div>

              {/* Topic */}
              <div className="relative sm:col-span-2">
                <select
                  id="topic"
                  className={`w-full h-12 rounded-xl border border-gray-200 bg-white/70 px-4 text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 transition ${eTopic ? "ring-2 !ring-red-500" : ""}`}
                  value={topic}
                  onChange={(e) => {
                    const v = e.target.value as typeof topic;
                    setTopic(v);
                    setETopic(vTopic(v));
                  }}
                >
                  <option value="">— Chọn nhóm khiếu nại —</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {eTopic && <p className="mt-1 text-xs text-red-600">{eTopic}</p>}
              </div>

              {/* Subject */}
              <div className="relative sm:col-span-2">
                <input
                  id="subject"
                  className={`${fieldBase} ${eSubject ? "ring-2 !ring-red-500" : ""}`}
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setESubject(vSubject(e.target.value));
                  }}
                  placeholder="Tiêu đề"
                />
                <label htmlFor="subject" className={labelBase}>Tiêu đề *</label>
                {eSubject && <p className="mt-1 text-xs text-red-600">{eSubject}</p>}
              </div>

              {/* Message */}
              <div className="relative sm:col-span-2">
                <textarea
                  id="message"
                  className={`peer w-full min-h-[140px] rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 placeholder-transparent shadow-sm focus:border-transparent focus:ring-2 focus:ring-orange-500 transition ${eMsg ? "ring-2 !ring-red-500" : ""}`}
                  value={message}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, charMax);
                    setMessage(v);
                    setEMsg(vMsg(v));
                  }}
                  placeholder="Nội dung"
                />
                <label htmlFor="message" className="pointer-events-none absolute -top-2.5 left-3 bg-white/90 px-2 text-xs font-semibold text-gray-600 rounded">Nội dung *</label>
                <div className="mt-1 flex items-center justify-between text-xs">
                  {eMsg ? <span className="text-red-600">{eMsg}</span> : <span />}
                  <span className="text-slate-500">{remain} ký tự còn lại</span>
                </div>
              </div>

              {/* Attachments */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-1">Tệp đính kèm (tối đa 3, ảnh/PDF, &lt; 3MB)</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-xl border border-dashed border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition">
                    Chọn tệp
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={onPickFiles}
                    />
                  </label>
                  {files.map((f, i) => (
                    <div key={i} className="relative overflow-hidden rounded-xl ring-1 ring-slate-200 bg-white">
                      {f.type.startsWith("image/") ? (
                        <img src={f.preview} alt={f.name} className="h-16 w-16 object-cover" />
                      ) : (
                        <div className="h-16 w-16 grid place-items-center text-xs text-slate-700">PDF</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs shadow"
                        aria-label="Xóa tệp"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact by */}
              <div className="sm:col-span-2">
                <span className="block text-sm font-semibold text-slate-800 mb-1">Ưu tiên liên hệ qua</span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="contactBy"
                      value="email"
                      checked={contactBy === "email"}
                      onChange={() => setContactBy("email")}
                    />
                    Email
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="contactBy"
                      value="phone"
                      checked={contactBy === "phone"}
                      onChange={() => setContactBy("phone")}
                    />
                    Điện thoại
                  </label>
                </div>
              </div>

              {/* Agree */}
              <div className="sm:col-span-2">
                <label className="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      setEAgree(e.target.checked ? "" : "Vui lòng xác nhận đồng ý xử lý thông tin khiếu nại");
                    }}
                    className="mt-0.5"
                  />
                  <span>
                    Tôi đồng ý cho TimeWatch sử dụng thông tin trên để xử lý khiếu nại theo{" "}
                    <Link href="/chinh-sach-bao-mat" className="text-orange-600 hover:underline">Chính sách bảo mật</Link>.
                  </span>
                </label>
                {eAgree && <p className="mt-1 text-xs text-red-600">{eAgree}</p>}
              </div>
            </div>

            {/* alert */}
            {alert && (
              <div
                className={`mt-5 rounded-xl px-4 py-3 text-sm ring-1 ${
                  alert.type === "success"
                    ? "bg-green-50 text-green-700 ring-green-200"
                    : "bg-red-50 text-red-700 ring-red-200"
                }`}
              >
                {alert.text}
              </div>
            )}

            {/* submit */}
            <div className="mt-6">
              <button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className={ORANGE_BTN}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi khiếu nại"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
