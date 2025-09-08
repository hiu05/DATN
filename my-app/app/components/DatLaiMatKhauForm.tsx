"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function DatLaiMatKhauForm({
  token,
  onSuccess,
  onBack,
}: {
  token: string;
  onSuccess?: () => void;
  onBack?: () => void;
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const [msg, setMsg] = useState("");

  const validate = () => {
    let ok = true;
    if (!pw || pw.length < 6) {
      setErr1("Mật khẩu phải từ 6 ký tự trở lên");
      ok = false;
    } else setErr1("");
    if (pw !== pw2) {
      setErr2("Mật khẩu nhập lại không khớp");
      ok = false;
    } else setErr2("");
    return ok;
  };

  const handleSubmit = async () => {
    if (!token) {
      setMsg("Liên kết không hợp lệ hoặc đã hết hạn.");
      return;
    }
    if (!validate()) return;

    const res = await fetch("/api/dat-lai-mat-khau", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: pw }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("Đặt lại mật khẩu thành công.");
      onSuccess?.();
    } else {
      setMsg(data?.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <>      

      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500">*</span>
        <input
          type={show1 ? "text" : "password"}
          placeholder="Mật khẩu mới"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => setShow1(!show1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {show1 ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {err1 && <p className="mb-2 text-sm text-red-600">{err1}</p>}

      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500">*</span>
        <input
          type={show2 ? "text" : "password"}
          placeholder="Nhập lại mật khẩu"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => setShow2(!show2)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {show2 ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {err2 && <p className="mb-2 text-sm text-red-600">{err2}</p>}

      {msg && (
        <p
          className={`mb-2 text-sm ${
            msg.includes("thành công") ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="mt-2 w-full h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 transition"
      >
        Cập nhật mật khẩu
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-3 w-full h-11 rounded border text-center flex items-center justify-center hover:bg-gray-50 transition"
      >
        Quay lại đăng nhập
      </button>

      <p className="mt-6 text-center text-xs text-gray-500">
        Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
      </p>
    </>
  );
}
