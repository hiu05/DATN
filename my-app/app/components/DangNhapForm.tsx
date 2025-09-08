"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type Props = {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void; 
  onSwitchToForgot?: () => void; 
};

export default function DangNhapForm({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgot,
}: Props) {
  const [email, setEmail] = useState("");
  const [mat_khau, setMK] = useState("");
  const [showPW, setShowPW] = useState(false);
  const [tb, setTB] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (loading) return;
    setTB("");
    setLoading(true);
    try {
      const res = await fetch("/api/dang-nhap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mat_khau }),
      });
      const data = await res.json();

      if (!res.ok) {
        setTB(data?.message || "Đăng nhập thất bại");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess?.();
      router.refresh(); 
    } catch {
      setTB("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative mb-4">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type="text"
          placeholder="Nhập Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      <div className="relative mb-2">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 text-red-500 select-none">
          *
        </span>
        <input
          type={showPW ? "text" : "password"}
          placeholder="Mật khẩu"
          value={mat_khau}
          onChange={(e) => setMK(e.target.value)}
          className="w-full h-11 rounded border border-gray-300 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
        <button
          type="button"
          onClick={() => setShowPW(!showPW)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={showPW ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPW ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <div className="flex justify-between items-center mb-1 text-sm">
        
        <span className="text-transparent select-none">.</span>
      </div>

      {tb && <p className="mb-3 text-sm text-red-600">{tb}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-11 rounded bg-[#e23c31] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập..." : "Đăng Nhập Ngay"}
      </button>

      <button
        type="button"
        onClick={() => onSwitchToSignup?.()}
        className="mt-3 w-full h-11 rounded border text-center flex items-center justify-center hover:bg-gray-50 transition"
      >
        Tạo tài khoản mới
      </button>
      <button
          type="button"
          onClick={() => onSwitchToForgot?.()}
          className="mt-1 text-blue-600 hover:underline"
        >
          Quên mật khẩu?
        </button>

      <p className="mt-6 text-center text-xs text-gray-500">
        Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
      </p>
    </>
  );
}
