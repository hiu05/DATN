/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToSignup?: () => void;
};

export default function QuenMatKhauForm({
  onSuccess,
  onSwitchToLogin,
  onSwitchToSignup,
}: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [tb, setTB] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (v: string) => {
    setEmail(v);
    if (!v) setErrEmail("Vui lòng nhập email");
    else if (!/^\S+@\S+\.\S+$/.test(v)) setErrEmail("Email không hợp lệ");
    else setErrEmail("");
  };

  const handleSubmit = async () => {
    if (!email) {
      setErrEmail("Vui lòng nhập email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrEmail("Email không hợp lệ");
      return;
    }
    setErrEmail("");
    setTB("");
    if (loading) return;

    try {
      setLoading(true);
      const res = await fetch("/api/quen-mat-khau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setTB("Đã gửi email đặt lại mật khẩu, vui lòng kiểm tra hộp thư.");
        onSuccess?.();
        router.push("/dat-lai-mat-khau"); 
      } else {
        setTB(data?.message || "Có lỗi xảy ra.");
      }
    } catch {
      setTB("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">*</span>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => validateEmail(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {errEmail && <p className="mb-2 text-sm text-red-600">{errEmail}</p>}
      {tb && !errEmail && <p className={`mb-2 text-sm ${resColor(tb)}`}>{tb}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-2 h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>

      <div className="mt-3">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full h-11 rounded border border-gray-300 font-semibold hover:bg-gray-100 transition"
        >
          Quay lại đăng nhập
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
      </p>
    </>
  );
}

function resColor(msg: string) {
  return msg.toLowerCase().includes("thành công") ? "text-green-600" : "text-red-600";
}
